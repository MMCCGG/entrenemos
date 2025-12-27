import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { ProgresoService } from "../../../core/services/progreso.service";
import { EjercicioService } from "../../../core/services/ejercicio.service";
import { PlanUsuarioService } from "../../../core/services/plan-usuario.service";
import { EntrenamientoService } from "../../../core/services/entrenamiento.service";
import { AuthService } from "../../../core/services/auth.service";
import { UsuariosService } from "../../../core/services/usuarios.service";
import { Progreso as ProgresoModelo } from "../../../shared/models/progreso.model";
import { Ejercicio } from "../../../shared/models/ejercicio.model";
import { PlanUsuario } from "../../../shared/models/plan-usuario.model";
import { Usuario } from "../../../shared/models/usuario";
import { forkJoin } from "rxjs";

interface ProgresoConEjercicio extends ProgresoModelo {
  ejercicio?: Ejercicio;
}

interface ProgresoAgrupado {
  ejercicio: Ejercicio;
  progresos: ProgresoModelo[];
  mejorPeso?: number;
  mejorRepeticiones?: number;
  mejorTiempo?: number;
  totalSesiones: number;
}

@Component({
  selector: "app-progreso",
  imports: [CommonModule, RouterModule, Header, BottomNav],
  templateUrl: "./progreso.html",
  styleUrl: "./progreso.css",
})
export class Progreso implements OnInit {
  private progresoService = inject(ProgresoService);
  private ejercicioService = inject(EjercicioService);
  private planUsuarioService = inject(PlanUsuarioService);
  private entrenamientoService = inject(EntrenamientoService);
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  router = inject(Router);

  // Datos
  progresos: ProgresoModelo[] = [];
  ejercicios: Ejercicio[] = [];
  progresosAgrupados: ProgresoAgrupado[] = [];
  usuario: Usuario | null = null;
  usuarioId: number | null = null;
  planActivo: PlanUsuario | null = null;
  ejerciciosIdsDelPlan: number[] = [];

  // Estados
  error: string | null = null;
  cargando = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;
    this.error = null;

    await this.cargarUsuario();

    if (this.usuario && this.usuario.id) {
      this.usuarioId = this.usuario.id;
      this.cargarPlanActivo();
    } else {
      console.warn("Progreso: No se pudo cargar el usuario");
      this.cargando = false;
      this.error = "No se pudo cargar la información del usuario";
    }
  }

  async cargarUsuario(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      console.warn("Progreso: No hay token de autenticación");
      this.cargando = false;
      return Promise.resolve();
    }

    // Intentar primero con getCurrentUser (más eficiente)
    return new Promise<void>((resolve) => {
      this.authService.getCurrentUser().subscribe({
        next: (usuario: Usuario) => {
          this.usuario = usuario;
          this.usuarioId = usuario.id || null;
          console.log("Progreso: Usuario cargado con getCurrentUser:", usuario);
          resolve();
        },
        error: (err) => {
          console.warn(
            "Progreso: getCurrentUser falló, intentando método alternativo:",
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
        console.warn("Progreso: No se pudo extraer el email del token");
        this.cargando = false;
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        this.usuariosService.listarUsuarios().subscribe({
          next: (usuarios: Usuario[]) => {
            this.usuario =
              usuarios.find((u: Usuario) => u.email === email) || null;

            if (!this.usuario) {
              console.warn("Progreso: Usuario no encontrado con email:", email);
              this.error =
                "No se pudo encontrar tu usuario. Por favor, contacta al administrador.";
            } else {
              this.usuarioId = this.usuario.id || null;
              console.log(
                "Progreso: Usuario cargado correctamente:",
                this.usuario
              );
            }
            resolve();
          },
          error: (err) => {
            console.error("Progreso: Error cargando usuarios:", err);
            this.error = "Error al cargar la información del usuario";
            resolve();
          },
        });
      });
    } catch (error) {
      console.error("Progreso: Error en cargarUsuarioPorEmail:", error);
      this.cargando = false;
      return Promise.resolve();
    }
  }

  cargarPlanActivo(): void {
    if (!this.usuarioId) {
      this.cargando = false;
      this.error = "No se pudo identificar al usuario";
      return;
    }

    // Intentar cargar desde el backend primero
    this.planUsuarioService.obtenerPlanActivo(this.usuarioId).subscribe({
      next: (plan) => {
        if (plan) {
          this.planActivo = plan;
          // Si el plan tiene entrenamiento con ejerciciosIds, usarlos
          if (
            plan.entrenamiento?.ejerciciosIds &&
            plan.entrenamiento.ejerciciosIds.length > 0
          ) {
            this.ejerciciosIdsDelPlan = plan.entrenamiento.ejerciciosIds;
            // Si no tiene ejercicios cargados, cargarlos
            if (
              !plan.entrenamiento.ejercicios ||
              plan.entrenamiento.ejercicios.length === 0
            ) {
              this.cargarEjerciciosDelPlan();
            } else {
              this.cargarProgresos();
            }
          } else if (plan.entrenamientoId) {
            // Si solo tiene entrenamientoId, cargar el entrenamiento completo
            this.cargarEntrenamientoCompleto(plan.entrenamientoId);
          } else {
            this.cargarProgresos();
          }
        } else {
          // Fallback a localStorage
          this.cargarPlanDesdeLocalStorage();
        }
      },
      error: (err) => {
        console.warn("Error cargando plan desde backend:", err);
        // Fallback a localStorage
        this.cargarPlanDesdeLocalStorage();
      },
    });
  }

  cargarPlanDesdeLocalStorage(): void {
    if (!this.usuarioId) {
      this.planActivo = null;
      this.cargarProgresos();
      return;
    }

    const planGuardado = localStorage.getItem(`plan-activo-${this.usuarioId}`);
    if (planGuardado) {
      try {
        const plan = JSON.parse(planGuardado);
        if (plan && (plan.entrenamientoId || plan.entrenamiento)) {
          this.planActivo = plan;
          if (
            plan.entrenamiento?.ejerciciosIds &&
            plan.entrenamiento.ejerciciosIds.length > 0
          ) {
            this.ejerciciosIdsDelPlan = plan.entrenamiento.ejerciciosIds;
            if (
              !plan.entrenamiento.ejercicios ||
              plan.entrenamiento.ejercicios.length === 0
            ) {
              this.cargarEjerciciosDelPlan();
            } else {
              this.cargarProgresos();
            }
          } else if (plan.entrenamientoId) {
            this.cargarEntrenamientoCompleto(plan.entrenamientoId);
          } else {
            this.cargarProgresos();
          }
        } else {
          this.planActivo = null;
          this.cargarProgresos();
        }
      } catch (error) {
        console.error("Error parseando plan desde localStorage:", error);
        this.planActivo = null;
        this.cargarProgresos();
      }
    } else {
      this.planActivo = null;
      this.cargarProgresos();
    }
  }

  cargarEntrenamientoCompleto(entrenamientoId: number): void {
    this.entrenamientoService.obtenerPorId(entrenamientoId).subscribe({
      next: (entrenamiento) => {
        if (this.planActivo) {
          if (!this.planActivo.entrenamiento) {
            this.planActivo.entrenamiento = entrenamiento;
          } else {
            this.planActivo.entrenamiento = {
              ...this.planActivo.entrenamiento,
              ...entrenamiento,
            };
          }
          if (
            this.planActivo.entrenamiento.ejerciciosIds &&
            this.planActivo.entrenamiento.ejerciciosIds.length > 0
          ) {
            this.ejerciciosIdsDelPlan =
              this.planActivo.entrenamiento.ejerciciosIds;
            this.cargarEjerciciosDelPlan();
          } else {
            this.cargarProgresos();
          }
        }
      },
      error: (err) => {
        console.error("Error cargando entrenamiento completo:", err);
        this.cargarProgresos();
      },
    });
  }

  cargarEjerciciosDelPlan(): void {
    if (
      !this.planActivo ||
      !this.ejerciciosIdsDelPlan ||
      this.ejerciciosIdsDelPlan.length === 0
    ) {
      this.cargarProgresos();
      return;
    }

    const observables = this.ejerciciosIdsDelPlan.map((id) =>
      this.ejercicioService.obtenerPorId(id)
    );

    forkJoin(observables).subscribe({
      next: (ejercicios) => {
        if (this.planActivo?.entrenamiento) {
          this.planActivo.entrenamiento.ejercicios = ejercicios;
        }
        this.cargarProgresos();
      },
      error: (err) => {
        console.error("Error cargando ejercicios del plan:", err);
        this.cargarProgresos();
      },
    });
  }

  cargarProgresos(): void {
    if (!this.usuarioId) {
      this.cargando = false;
      this.error = "No se pudo identificar al usuario";
      return;
    }

    // Cargar progresos y ejercicios en paralelo
    forkJoin({
      progresos: this.progresoService.obtenerPorUsuario(this.usuarioId),
      ejercicios: this.ejercicioService.listar(),
    }).subscribe({
      next: ({ progresos, ejercicios }) => {
        // Filtrar progresos por ejercicios del plan activo
        let progresosFiltrados = progresos;
        if (this.planActivo && this.ejerciciosIdsDelPlan.length > 0) {
          progresosFiltrados = progresos.filter((progreso) =>
            this.ejerciciosIdsDelPlan.includes(progreso.ejercicioId)
          );
        }

        this.progresos = progresosFiltrados.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.ejercicios = ejercicios;
        this.agruparProgresos();
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando progresos:", err);
        this.error = "Error al cargar el historial de progreso";
        this.cargando = false;
      },
    });
  }

  agruparProgresos(): void {
    const agrupados = new Map<number, ProgresoAgrupado>();

    // Agrupar por ejercicio
    this.progresos.forEach((progreso) => {
      const ejercicio = this.ejercicios.find(
        (e) => e.id === progreso.ejercicioId
      );

      if (!ejercicio) return;

      if (!agrupados.has(progreso.ejercicioId)) {
        agrupados.set(progreso.ejercicioId, {
          ejercicio,
          progresos: [],
          totalSesiones: 0,
        });
      }

      const grupo = agrupados.get(progreso.ejercicioId)!;
      grupo.progresos.push(progreso);
      grupo.totalSesiones++;

      // Calcular mejores marcas
      if (progreso.peso !== undefined && progreso.peso !== null) {
        if (
          grupo.mejorPeso === undefined ||
          progreso.peso > grupo.mejorPeso
        ) {
          grupo.mejorPeso = progreso.peso;
        }
      }

      if (
        progreso.repeticiones !== undefined &&
        progreso.repeticiones !== null
      ) {
        if (
          grupo.mejorRepeticiones === undefined ||
          progreso.repeticiones > grupo.mejorRepeticiones
        ) {
          grupo.mejorRepeticiones = progreso.repeticiones;
        }
      }

      if (progreso.tiempo !== undefined && progreso.tiempo !== null) {
        if (
          grupo.mejorTiempo === undefined ||
          progreso.tiempo < grupo.mejorTiempo
        ) {
          grupo.mejorTiempo = progreso.tiempo;
        }
      }
    });

    // Ordenar por fecha más reciente
    this.progresosAgrupados = Array.from(agrupados.values()).sort((a, b) => {
      const fechaA = a.progresos[0]?.fecha || "";
      const fechaB = b.progresos[0]?.fecha || "";
      return new Date(fechaB).getTime() - new Date(fechaA).getTime();
    });
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  formatearTiempo(segundos: number): string {
    if (segundos < 60) {
      return `${Math.round(segundos)}s`;
    }
    const minutos = Math.floor(segundos / 60);
    const segs = Math.round(segundos % 60);
    return `${minutos}m ${segs}s`;
  }

  get tienePlanActivo(): boolean {
    return (
      this.planActivo !== null &&
      this.ejerciciosIdsDelPlan !== null &&
      this.ejerciciosIdsDelPlan.length > 0
    );
  }
}
