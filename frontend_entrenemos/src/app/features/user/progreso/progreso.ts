import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { ProgresoService } from "../../../core/services/progreso.service";
import { EjercicioService } from "../../../core/services/ejercicio.service";
import { EntrenamientoService } from "../../../core/services/entrenamiento.service";
import { PlanUsuarioService } from "../../../core/services/plan-usuario.service";
import { AuthService } from "../../../core/services/auth.service";
import { UsuariosService } from "../../../core/services/usuarios.service";
import { Progreso as ProgresoModelo } from "../../../shared/models/progreso.model";
import { Ejercicio } from "../../../shared/models/ejercicio.model";
import { PlanUsuario } from "../../../shared/models/plan-usuario.model";
import { Usuario } from "../../../shared/models/usuario";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-progreso",
  imports: [CommonModule, FormsModule, RouterModule, Header, BottomNav],
  templateUrl: "./progreso.html",
  styleUrl: "./progreso.css",
})
export class Progreso implements OnInit {
  private progresoService = inject(ProgresoService);
  private ejercicioService = inject(EjercicioService);
  private entrenamientoService = inject(EntrenamientoService);
  private planUsuarioService = inject(PlanUsuarioService);
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  router = inject(Router);

  // Datos del formulario
  ejercicios: Ejercicio[] = [];
  ejerciciosDelPlan: Ejercicio[] = []; // Ejercicios del plan activo
  ejercicioSeleccionadoId: number | null = null;
  peso: number | null = null;
  repeticiones: number | null = null;
  tiempo: number | null = null;
  fecha: string = new Date().toISOString().split("T")[0]; // Fecha actual

  // Usuario y plan activo
  usuario: Usuario | null = null;
  usuarioId: number | null = null;
  planActivo: PlanUsuario | null = null;

  // Estados
  guardando = false;
  exito = false;
  error: string | null = null;
  cargando = false;

  ngOnInit(): void {
    this.cargarUsuarioYPlan();
  }

  async cargarUsuarioYPlan(): Promise<void> {
    this.cargando = true;
    this.error = null;

    await this.cargarUsuario();

    if (this.usuario && this.usuario.id) {
      this.usuarioId = this.usuario.id;
      this.cargarPlanActivo();
    } else {
      console.warn("Progreso: No se pudo cargar el usuario");
      this.cargando = false;
      this.cargarEjercicios();
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
      console.warn("Progreso: No hay usuarioId para cargar plan");
      this.cargarEjercicios();
      return;
    }

    console.log(
      "Progreso: Cargando plan activo para usuarioId:",
      this.usuarioId
    );

    // Intentar cargar desde el backend primero
    this.planUsuarioService.obtenerPlanActivo(this.usuarioId).subscribe({
      next: (plan) => {
        if (plan) {
          console.log("Progreso: Plan cargado desde backend:", plan);
          this.planActivo = plan;
          this.cargarEjerciciosDelPlan();
          this.cargarEjercicios();
        } else {
          console.log(
            "Progreso: No hay plan en backend, intentando localStorage"
          );
          // Fallback a localStorage
          this.cargarPlanDesdeLocalStorage();
          this.cargarEjercicios();
        }
      },
      error: (err) => {
        console.warn("Progreso: Error cargando plan desde backend:", err);
        // Fallback a localStorage
        this.cargarPlanDesdeLocalStorage();
        this.cargarEjercicios();
      },
    });
  }

  cargarPlanDesdeLocalStorage(): void {
    if (!this.usuarioId) {
      this.planActivo = null;
      console.log("Progreso: No hay usuarioId, planActivo = null");
      return;
    }

    const planGuardado = localStorage.getItem(`plan-activo-${this.usuarioId}`);
    console.log("Progreso: Plan desde localStorage:", planGuardado);

    if (planGuardado) {
      try {
        const plan = JSON.parse(planGuardado);
        console.log("Progreso: Plan parseado:", plan);

        // Verificar que el plan tenga la estructura correcta
        if (plan && (plan.entrenamientoId || plan.entrenamiento)) {
          this.planActivo = plan;
          console.log("Progreso: Plan activo asignado:", this.planActivo);

          // Si el plan tiene entrenamientoId pero no entrenamiento completo, cargarlo
          const planActivo = this.planActivo;
          if (planActivo && planActivo.entrenamientoId) {
            if (
              !planActivo.entrenamiento ||
              !planActivo.entrenamiento.ejerciciosIds
            ) {
              console.log(
                "Progreso: Cargando entrenamiento completo para ID:",
                planActivo.entrenamientoId
              );
              this.cargarEntrenamientoCompleto(planActivo.entrenamientoId);
            } else {
              console.log(
                "Progreso: Plan tiene entrenamiento, cargando ejercicios"
              );
              this.cargarEjerciciosDelPlan();
            }
          } else if (planActivo && planActivo.entrenamiento) {
            console.log(
              "Progreso: Plan tiene entrenamiento, cargando ejercicios"
            );
            this.cargarEjerciciosDelPlan();
          } else {
            console.log(
              "Progreso: Plan no tiene entrenamiento ni entrenamientoId"
            );
          }
        } else {
          console.log(
            "Progreso: Plan no válido (sin entrenamientoId ni entrenamiento)"
          );
          this.planActivo = null;
        }
      } catch (error) {
        console.error("Error parseando plan desde localStorage:", error);
        this.planActivo = null;
      }
    } else {
      console.log("Progreso: No hay plan guardado en localStorage");
      this.planActivo = null;
    }
  }

  cargarEntrenamientoCompleto(entrenamientoId: number): void {
    console.log(
      "Progreso: Cargando entrenamiento completo, ID:",
      entrenamientoId
    );
    this.entrenamientoService.obtenerPorId(entrenamientoId).subscribe({
      next: (entrenamiento) => {
        console.log("Progreso: Entrenamiento cargado:", entrenamiento);
        if (this.planActivo) {
          if (!this.planActivo.entrenamiento) {
            this.planActivo.entrenamiento = entrenamiento;
          } else {
            // Actualizar con los datos del backend
            this.planActivo.entrenamiento = {
              ...this.planActivo.entrenamiento,
              ...entrenamiento,
            };
          }
          console.log(
            "Progreso: Plan actualizado con entrenamiento:",
            this.planActivo
          );
          this.cargarEjerciciosDelPlan();
        }
      },
      error: (err) => {
        console.error("Error cargando entrenamiento completo:", err);
        // Intentar cargar ejercicios de todas formas
        this.cargarEjerciciosDelPlan();
      },
    });
  }

  cargarEjerciciosDelPlan(): void {
    if (!this.planActivo) {
      this.ejerciciosDelPlan = [];
      return;
    }

    // Si el plan tiene entrenamiento con ejercicios ya cargados
    if (
      this.planActivo.entrenamiento?.ejercicios &&
      this.planActivo.entrenamiento.ejercicios.length > 0
    ) {
      this.ejerciciosDelPlan = this.planActivo.entrenamiento.ejercicios;
      return;
    }

    // Si tiene IDs de ejercicios, cargarlos
    if (
      this.planActivo.entrenamiento?.ejerciciosIds &&
      this.planActivo.entrenamiento.ejerciciosIds.length > 0
    ) {
      const observables = this.planActivo.entrenamiento.ejerciciosIds.map(
        (id) => this.ejercicioService.obtenerPorId(id)
      );

      forkJoin(observables).subscribe({
        next: (ejercicios) => {
          this.ejerciciosDelPlan = ejercicios;
          if (this.planActivo?.entrenamiento) {
            this.planActivo.entrenamiento.ejercicios = ejercicios;
          }
        },
        error: (err) => {
          console.error("Error cargando ejercicios del plan:", err);
          this.ejerciciosDelPlan = [];
        },
      });
    } else {
      // Si no tiene ejerciciosIds, intentar cargar el entrenamiento completo
      if (this.planActivo.entrenamientoId) {
        this.ejercicioService.listar().subscribe({
          next: (todosEjercicios) => {
            // Intentar obtener el entrenamiento completo
            // Por ahora, dejamos ejerciciosDelPlan vacío si no hay IDs
            this.ejerciciosDelPlan = [];
          },
          error: () => {
            this.ejerciciosDelPlan = [];
          },
        });
      } else {
        this.ejerciciosDelPlan = [];
      }
    }
  }

  cargarEjercicios(): void {
    this.ejercicioService.listar().subscribe({
      next: (ejercicios) => {
        this.ejercicios = ejercicios;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando ejercicios:", err);
        this.error = "Error al cargar los ejercicios";
        this.cargando = false;
      },
    });
  }

  get ejerciciosDisponibles(): Ejercicio[] {
    // Solo mostrar ejercicios del plan activo si existe
    if (this.planActivo && this.ejerciciosDelPlan.length > 0) {
      return this.ejerciciosDelPlan;
    }
    // Si no hay plan activo, no mostrar ejercicios
    return [];
  }

  get tienePlanActivo(): boolean {
    // Verificar que existe plan activo y tiene entrenamiento o entrenamientoId
    const tienePlan = this.planActivo !== null;
    const tieneEntrenamiento =
      this.planActivo?.entrenamiento !== null &&
      this.planActivo?.entrenamiento !== undefined;
    const tieneEntrenamientoId =
      this.planActivo?.entrenamientoId !== null &&
      this.planActivo?.entrenamientoId !== undefined;

    return tienePlan && (tieneEntrenamiento || tieneEntrenamientoId);
  }

  registrarProgreso(): void {
    // Validaciones
    if (!this.ejercicioSeleccionadoId) {
      this.error = "Debes seleccionar un ejercicio";
      return;
    }

    if (!this.peso && !this.repeticiones && !this.tiempo) {
      this.error = "Debes registrar al menos peso, repeticiones o tiempo";
      return;
    }

    if (!this.usuarioId) {
      this.error = "No se pudo identificar al usuario";
      return;
    }

    // Preparar datos
    const progreso: ProgresoModelo = {
      fecha: this.fecha,
      peso: this.peso || undefined,
      repeticiones: this.repeticiones || undefined,
      tiempo: this.tiempo || undefined,
      usuarioId: this.usuarioId,
      ejercicioId: this.ejercicioSeleccionadoId,
    };

    this.guardando = true;
    this.error = null;
    this.exito = false;

    this.progresoService.crear(progreso).subscribe({
      next: () => {
        this.exito = true;
        this.guardando = false;

        // Si hay un plan activo, marcar el ejercicio como completado
        if (this.planActivo && this.ejercicioSeleccionadoId) {
          this.marcarEjercicioCompletadoEnPlan(this.ejercicioSeleccionadoId);
        }

        this.resetearFormulario();
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          this.exito = false;
        }, 3000);
      },
      error: (err) => {
        console.error("Error guardando progreso:", err);
        this.error = "Error al guardar el progreso";
        this.guardando = false;
      },
    });
  }

  marcarEjercicioCompletadoEnPlan(ejercicioId: number): void {
    if (!this.planActivo || !this.planActivo.id) {
      // Si no hay ID del plan (solo localStorage), actualizar localmente
      if (this.planActivo) {
        if (!this.planActivo.ejerciciosCompletados) {
          this.planActivo.ejerciciosCompletados = [];
        }
        if (!this.planActivo.ejerciciosCompletados.includes(ejercicioId)) {
          this.planActivo.ejerciciosCompletados.push(ejercicioId);
          this.planActivo.fechaUltimaSesion = new Date()
            .toISOString()
            .split("T")[0];

          // Guardar en localStorage
          if (this.usuarioId) {
            localStorage.setItem(
              `plan-activo-${this.usuarioId}`,
              JSON.stringify(this.planActivo)
            );
          }
        }
      }
      return;
    }

    // Intentar marcar en el backend
    this.planUsuarioService
      .marcarEjercicioCompletado(this.planActivo.id, ejercicioId)
      .subscribe({
        next: (planActualizado) => {
          this.planActivo = planActualizado;
          // Actualizar también localStorage
          if (this.usuarioId) {
            localStorage.setItem(
              `plan-activo-${this.usuarioId}`,
              JSON.stringify(this.planActivo)
            );
          }
        },
        error: (err) => {
          console.warn("Error marcando ejercicio completado en backend:", err);
          // Actualizar localmente como fallback
          if (this.planActivo) {
            if (!this.planActivo.ejerciciosCompletados) {
              this.planActivo.ejerciciosCompletados = [];
            }
            if (!this.planActivo.ejerciciosCompletados.includes(ejercicioId)) {
              this.planActivo.ejerciciosCompletados.push(ejercicioId);
              this.planActivo.fechaUltimaSesion = new Date()
                .toISOString()
                .split("T")[0];

              if (this.usuarioId) {
                localStorage.setItem(
                  `plan-activo-${this.usuarioId}`,
                  JSON.stringify(this.planActivo)
                );
              }
            }
          }
        },
      });
  }

  resetearFormulario(): void {
    this.ejercicioSeleccionadoId = null;
    this.peso = null;
    this.repeticiones = null;
    this.tiempo = null;
    this.fecha = new Date().toISOString().split("T")[0];
  }

  esEjercicioCompletado(ejercicioId: number): boolean {
    if (!this.planActivo) return false;
    return (
      this.planActivo.ejerciciosCompletados?.includes(ejercicioId) || false
    );
  }

  obtenerProgresoPlan(): number {
    if (!this.planActivo) return 0;
    return this.planUsuarioService.calcularProgreso(this.planActivo);
  }
}
