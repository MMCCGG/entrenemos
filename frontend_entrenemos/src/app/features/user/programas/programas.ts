import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { EntrenamientoService } from "../../../core/services/entrenamiento.service";
import { EjercicioService } from "../../../core/services/ejercicio.service";
import { PlanUsuarioService } from "../../../core/services/plan-usuario.service";
import { AuthService } from "../../../core/services/auth.service";
import { UsuariosService } from "../../../core/services/usuarios.service";
import { Entrenamiento } from "../../../shared/models/entrenamiento.model";
import { Ejercicio } from "../../../shared/models/ejercicio.model";
import {
  PlanUsuario,
  PlanDisponible,
} from "../../../shared/models/plan-usuario.model";
import { Usuario } from "../../../shared/models/usuario";
import { forkJoin, map, of } from "rxjs";

interface EntrenamientoConEjercicios extends Entrenamiento {
  ejercicios: Ejercicio[];
}

@Component({
  selector: "app-programas",
  imports: [CommonModule, Header, BottomNav],
  templateUrl: "./programas.html",
  styleUrl: "./programas.css",
})
export class Programas implements OnInit {
  private entrenamientoService = inject(EntrenamientoService);
  private ejercicioService = inject(EjercicioService);
  private planUsuarioService = inject(PlanUsuarioService);
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  router = inject(Router);

  vistaSeleccionada: "disponibles" | "mi-plan" = "disponibles";
  planesDisponibles: PlanDisponible[] = [];
  planActivo: PlanUsuario | null = null;
  usuario: Usuario | null = null;
  cargando = false;
  error: string | null = null;
  asignando = false;

  ngOnInit(): void {
    this.cargarUsuarioYPlan();
  }

  cambiarVista(vista: "disponibles" | "mi-plan"): void {
    this.vistaSeleccionada = vista;
    if (vista === "disponibles") {
      this.cargarPlanesDisponibles();
    } else {
      this.cargarPlanActivo();
    }
  }

  cargarUsuarioYPlan() {
    this.cargando = true;
    this.cargarUsuario().then(() => {
      this.cargarPlanActivo();
      this.cargarPlanesDisponibles();
    });
  }

  async cargarUsuario() {
    const token = this.authService.getToken();
    if (!token) {
      this.cargando = false;
      return;
    }

    try {
      const { JwtUtil } = await import("../../../shared/utils/jwt.util");
      const email = JwtUtil.getEmailFromToken(token);
      if (email) {
        this.usuariosService.listarUsuarios().subscribe({
          next: (usuarios: Usuario[]) => {
            this.usuario =
              usuarios.find((u: Usuario) => u.email === email) || null;
          },
          error: () => {
            this.cargando = false;
          },
        });
      }
    } catch {
      this.cargando = false;
    }
  }

  cargarPlanesDisponibles(): void {
    this.cargando = true;
    this.error = null;

    this.entrenamientoService.listar().subscribe({
      next: (entrenamientos) => {
        // Convertir entrenamientos a planes disponibles
        const planes: PlanDisponible[] = entrenamientos.map((ent) => {
          let duracionDias = 7; // Por defecto
          if (ent.fechaInicio && ent.fechaFin) {
            const inicio = new Date(ent.fechaInicio);
            const fin = new Date(ent.fechaFin);
            duracionDias = Math.ceil(
              (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
            );
          }

          return {
            entrenamiento: ent,
            duracionDias,
            dificultad: this.estimarDificultad(ent),
            categoria: "General",
          };
        });

        // Cargar ejercicios para cada plan
        if (planes.length === 0) {
          this.planesDisponibles = [];
          this.cargando = false;
          return;
        }

        const solicitudesEjercicios = planes.map((plan) => {
          const ent = plan.entrenamiento;
          if (!ent.ejerciciosIds || ent.ejerciciosIds.length === 0) {
            return of({
              ...plan,
              entrenamiento: { ...ent, ejercicios: [] as Ejercicio[] },
            });
          }

          const observablesEjercicios = ent.ejerciciosIds.map((id) =>
            this.ejercicioService.obtenerPorId(id)
          );

          return forkJoin(observablesEjercicios).pipe(
            map((ejercicios) => ({
              ...plan,
              entrenamiento: { ...ent, ejercicios },
            }))
          );
        });

        forkJoin(solicitudesEjercicios).subscribe({
          next: (planesConEjercicios) => {
            this.planesDisponibles = planesConEjercicios as PlanDisponible[];
            this.cargando = false;
          },
          error: (err) => {
            console.error("Error cargando ejercicios:", err);
            this.error = "Error al cargar los ejercicios";
            this.cargando = false;
          },
        });
      },
      error: (err) => {
        console.error("Error cargando planes:", err);
        this.error = "Error al cargar los planes disponibles";
        this.cargando = false;
      },
    });
  }

  cargarPlanActivo(): void {
    if (!this.usuario?.id) {
      this.planActivo = null;
      return;
    }

    // Por ahora simulamos que no hay endpoint, usamos localStorage
    const planGuardado = localStorage.getItem(`plan-activo-${this.usuario.id}`);
    if (planGuardado) {
      try {
        this.planActivo = JSON.parse(planGuardado);
      } catch {
        this.planActivo = null;
      }
    } else {
      this.planActivo = null;
    }
  }

  seleccionarPlan(plan: PlanDisponible): void {
    if (!this.usuario?.id || !plan.entrenamiento.id) {
      alert("Error: No se puede asignar el plan");
      return;
    }

    if (this.planActivo) {
      if (
        !confirm(
          "Ya tienes un plan activo. ¿Deseas reemplazarlo por este nuevo plan?"
        )
      ) {
        return;
      }
    }

    this.asignando = true;

    // Por ahora guardamos en localStorage hasta que tengamos el backend
    const nuevoPlan: PlanUsuario = {
      usuarioId: this.usuario.id,
      entrenamientoId: plan.entrenamiento.id,
      fechaInicio: new Date().toISOString().split("T")[0],
      activo: true,
      entrenamiento: plan.entrenamiento,
      ejerciciosCompletados: [],
    };

    // Calcular fecha fin basada en duración
    const fechaInicio = new Date(nuevoPlan.fechaInicio);
    fechaInicio.setDate(fechaInicio.getDate() + plan.duracionDias);
    nuevoPlan.fechaFin = fechaInicio.toISOString().split("T")[0];

    localStorage.setItem(
      `plan-activo-${this.usuario.id}`,
      JSON.stringify(nuevoPlan)
    );

    this.planActivo = nuevoPlan;
    this.asignando = false;
    this.vistaSeleccionada = "mi-plan";

    alert(`¡Plan "${plan.entrenamiento.nombre}" asignado con éxito!`);
  }

  estimarDificultad(
    entrenamiento: Entrenamiento
  ): "Principiante" | "Intermedio" | "Avanzado" {
    const numEjercicios = entrenamiento.ejerciciosIds?.length || 0;
    if (numEjercicios <= 3) return "Principiante";
    if (numEjercicios <= 6) return "Intermedio";
    return "Avanzado";
  }

  obtenerProgresoPlan(): number {
    if (!this.planActivo) return 0;
    return this.planUsuarioService.calcularProgreso(this.planActivo);
  }

  verPlanActivo(): void {
    if (this.planActivo?.entrenamiento?.id) {
      this.router.navigate(["/rutina", this.planActivo.entrenamiento.id]);
    }
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return "No especificada";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  }

  calcularDiasRestantes(): number {
    if (!this.planActivo?.fechaFin) return 0;
    const hoy = new Date();
    const fin = new Date(this.planActivo.fechaFin);
    const diff = fin.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
