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
    this.error = null;
    this.cargarUsuario().then(() => {
      if (this.usuario && this.usuario.id) {
        this.cargarPlanActivo();
        this.cargarPlanesDisponibles();
      } else {
        this.error =
          "No se pudo cargar la información del usuario. Por favor, recarga la página.";
        this.cargando = false;
        console.error("Usuario no cargado después de cargarUsuario()");
      }
    });
  }

  async cargarUsuario(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      console.warn("No hay token de autenticación");
      this.cargando = false;
      return Promise.resolve();
    }

    // Intentar primero con getCurrentUser (más eficiente)
    return new Promise<void>((resolve) => {
      this.authService.getCurrentUser().subscribe({
        next: (usuario: Usuario) => {
          this.usuario = usuario;
          console.log("Usuario cargado con getCurrentUser:", usuario);
          resolve();
        },
        error: (err) => {
          console.warn(
            "getCurrentUser falló, intentando método alternativo:",
            err
          );
          // Fallback: usar método anterior con email del token
          this.cargarUsuarioPorEmail(token).then(resolve);
        },
      });
    });
  }

  async cargarUsuarioPorEmail(token: string): Promise<void> {
    try {
      const { JwtUtil } = await import("../../../shared/utils/jwt.util");
      const email = JwtUtil.getEmailFromToken(token);
      if (!email) {
        console.warn("No se pudo extraer el email del token");
        this.cargando = false;
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        this.usuariosService.listarUsuarios().subscribe({
          next: (usuarios: Usuario[]) => {
            this.usuario =
              usuarios.find((u: Usuario) => u.email === email) || null;

            if (!this.usuario) {
              console.warn("Usuario no encontrado con email:", email);
              this.error =
                "No se pudo encontrar tu usuario. Por favor, contacta al administrador.";
            } else {
              console.log("Usuario cargado correctamente:", this.usuario);
            }
            resolve();
          },
          error: (err) => {
            console.error("Error cargando usuarios:", err);
            this.error = "Error al cargar los datos del usuario";
            this.cargando = false;
            resolve();
          },
        });
      });
    } catch (error) {
      console.error("Error en cargarUsuarioPorEmail:", error);
      this.cargando = false;
      return Promise.resolve();
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

    const usuarioId = this.usuario.id;
    this.cargando = true;
    // Intentar cargar desde el backend
    this.planUsuarioService.obtenerPlanActivo(usuarioId).subscribe({
      next: (plan) => {
        if (plan) {
          // Si el plan viene sin ejercicios, cargarlos
          if (
            plan.entrenamiento &&
            plan.entrenamiento.ejerciciosIds &&
            plan.entrenamiento.ejerciciosIds.length > 0 &&
            (!plan.entrenamiento.ejercicios ||
              plan.entrenamiento.ejercicios.length === 0)
          ) {
            this.cargarEjerciciosDelPlan(plan);
          } else {
            this.planActivo = plan;
            this.cargando = false;
          }
        } else {
          // Fallback a localStorage si el backend no tiene plan
          this.cargarPlanDesdeLocalStorage();
        }
      },
      error: (err) => {
        console.warn(
          "Error al cargar plan desde backend, usando localStorage:",
          err
        );
        // Fallback a localStorage si el backend no está disponible
        this.cargarPlanDesdeLocalStorage();
      },
    });
  }

  cargarPlanDesdeLocalStorage(): void {
    if (!this.usuario?.id) {
      this.planActivo = null;
      this.cargando = false;
      return;
    }

    const usuarioId = this.usuario.id;
    const planGuardado = localStorage.getItem(`plan-activo-${usuarioId}`);
    if (planGuardado) {
      try {
        this.planActivo = JSON.parse(planGuardado);
        // Intentar sincronizar con el backend si es posible
        if (this.planActivo && !this.planActivo.id) {
          this.sincronizarPlanConBackend();
        }
      } catch {
        this.planActivo = null;
      }
    } else {
      this.planActivo = null;
    }
    this.cargando = false;
  }

  cargarEjerciciosDelPlan(plan: PlanUsuario): void {
    if (
      !plan.entrenamiento?.ejerciciosIds ||
      plan.entrenamiento.ejerciciosIds.length === 0
    ) {
      this.planActivo = plan;
      this.cargando = false;
      return;
    }

    const observablesEjercicios = plan.entrenamiento.ejerciciosIds.map((id) =>
      this.ejercicioService.obtenerPorId(id)
    );

    forkJoin(observablesEjercicios).subscribe({
      next: (ejercicios) => {
        if (plan.entrenamiento) {
          plan.entrenamiento.ejercicios = ejercicios;
        }
        this.planActivo = plan;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando ejercicios del plan:", err);
        this.planActivo = plan;
        this.cargando = false;
      },
    });
  }

  sincronizarPlanConBackend(): void {
    if (
      !this.planActivo ||
      !this.usuario?.id ||
      !this.planActivo.entrenamientoId
    ) {
      return;
    }

    const usuarioId = this.usuario.id;
    const entrenamientoId = this.planActivo.entrenamientoId;

    // Intentar crear el plan en el backend
    this.planUsuarioService.asignarPlan(usuarioId, entrenamientoId).subscribe({
      next: (planCreado) => {
        // Actualizar el plan local con el ID del backend
        this.planActivo = { ...this.planActivo, ...planCreado };
        // Guardar en localStorage con el ID
        localStorage.setItem(
          `plan-activo-${usuarioId}`,
          JSON.stringify(this.planActivo)
        );
      },
      error: (err) => {
        console.warn("No se pudo sincronizar con el backend:", err);
        // Continuar con localStorage si el backend no está disponible
      },
    });
  }

  seleccionarPlan(plan: PlanDisponible): void {
    // Validaciones más detalladas
    if (!this.usuario) {
      alert(
        "Error: No se pudo identificar al usuario. Por favor, recarga la página."
      );
      console.error("Usuario no cargado:", this.usuario);
      return;
    }

    if (!this.usuario.id) {
      alert(
        "Error: El usuario no tiene un ID válido. Por favor, recarga la página."
      );
      console.error("Usuario sin ID:", this.usuario);
      return;
    }

    if (!plan.entrenamiento || !plan.entrenamiento.id) {
      alert("Error: El plan seleccionado no es válido.");
      console.error("Plan sin ID:", plan);
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

    const usuarioId = this.usuario.id;
    const entrenamientoId = plan.entrenamiento.id;

    this.asignando = true;
    this.error = null;

    // Intentar asignar el plan usando el backend
    this.planUsuarioService.asignarPlan(usuarioId, entrenamientoId).subscribe({
      next: (planCreado) => {
        // Si el plan viene sin ejercicios, cargarlos
        if (
          planCreado.entrenamiento &&
          planCreado.entrenamiento.ejerciciosIds &&
          planCreado.entrenamiento.ejerciciosIds.length > 0 &&
          (!planCreado.entrenamiento.ejercicios ||
            planCreado.entrenamiento.ejercicios.length === 0)
        ) {
          planCreado.entrenamiento = plan.entrenamiento;
        }

        // Calcular fecha fin si no viene del backend
        if (!planCreado.fechaFin) {
          const fechaInicio = new Date(planCreado.fechaInicio);
          fechaInicio.setDate(fechaInicio.getDate() + plan.duracionDias);
          planCreado.fechaFin = fechaInicio.toISOString().split("T")[0];
        }

        // Inicializar ejercicios completados si no vienen
        if (!planCreado.ejerciciosCompletados) {
          planCreado.ejerciciosCompletados = [];
        }

        this.planActivo = planCreado;
        this.asignando = false;
        this.vistaSeleccionada = "mi-plan";

        // Guardar también en localStorage como backup
        if (this.usuario?.id) {
          localStorage.setItem(
            `plan-activo-${this.usuario.id}`,
            JSON.stringify(this.planActivo)
          );
        }

        alert(`¡Plan "${plan.entrenamiento.nombre}" asignado con éxito!`);
      },
      error: (err) => {
        console.warn(
          "Error asignando plan en backend, usando localStorage:",
          err
        );
        // Fallback a localStorage si el backend no está disponible
        this.asignarPlanLocalStorage(plan);
      },
    });
  }

  asignarPlanLocalStorage(plan: PlanDisponible): void {
    if (!this.usuario?.id || !plan.entrenamiento.id) {
      return;
    }

    const usuarioId = this.usuario.id;
    const entrenamientoId = plan.entrenamiento.id;

    const nuevoPlan: PlanUsuario = {
      usuarioId: usuarioId,
      entrenamientoId: entrenamientoId,
      fechaInicio: new Date().toISOString().split("T")[0],
      activo: true,
      entrenamiento: plan.entrenamiento,
      ejerciciosCompletados: [],
    };

    // Calcular fecha fin basada en duración
    const fechaInicio = new Date(nuevoPlan.fechaInicio);
    fechaInicio.setDate(fechaInicio.getDate() + plan.duracionDias);
    nuevoPlan.fechaFin = fechaInicio.toISOString().split("T")[0];

    localStorage.setItem(`plan-activo-${usuarioId}`, JSON.stringify(nuevoPlan));

    this.planActivo = nuevoPlan;
    this.asignando = false;
    this.vistaSeleccionada = "mi-plan";

    alert(
      `¡Plan "${plan.entrenamiento.nombre}" asignado con éxito! (modo offline)`
    );
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
