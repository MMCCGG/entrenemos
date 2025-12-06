import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { WodTimerComponent } from "../../../shared/components/wod-timer/wod-timer";
import { ProgresoService } from "../../../core/services/progreso.service";
import { EjercicioService } from "../../../core/services/ejercicio.service";
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
  imports: [CommonModule, FormsModule, Header, BottomNav, WodTimerComponent],
  templateUrl: "./progreso.html",
  styleUrl: "./progreso.css",
})
export class Progreso implements OnInit {
  private progresoService = inject(ProgresoService);
  private ejercicioService = inject(EjercicioService);
  private planUsuarioService = inject(PlanUsuarioService);
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);

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
  mostrarSoloPlanActivo = true; // Filtrar ejercicios del plan activo

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
    const token = this.authService.getToken();
    if (!token) {
      this.cargando = false;
      this.cargarEjercicios();
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
            if (this.usuario?.id) {
              this.usuarioId = this.usuario.id;
              this.cargarPlanActivo();
            } else {
              this.cargarEjercicios();
            }
          },
          error: () => {
            this.cargando = false;
            this.cargarEjercicios();
          },
        });
      } else {
        this.cargarEjercicios();
      }
    } catch {
      this.cargando = false;
      this.cargarEjercicios();
    }
  }

  cargarPlanActivo(): void {
    if (!this.usuarioId) {
      this.cargarEjercicios();
      return;
    }

    // Intentar cargar desde el backend
    this.planUsuarioService.obtenerPlanActivo(this.usuarioId).subscribe({
      next: (plan) => {
        if (plan) {
          this.planActivo = plan;
          this.cargarEjerciciosDelPlan();
        } else {
          // Fallback a localStorage
          this.cargarPlanDesdeLocalStorage();
        }
        this.cargarEjercicios();
      },
      error: () => {
        // Fallback a localStorage
        this.cargarPlanDesdeLocalStorage();
        this.cargarEjercicios();
      },
    });
  }

  cargarPlanDesdeLocalStorage(): void {
    if (!this.usuarioId) {
      return;
    }

    const planGuardado = localStorage.getItem(`plan-activo-${this.usuarioId}`);
    if (planGuardado) {
      try {
        this.planActivo = JSON.parse(planGuardado);
        this.cargarEjerciciosDelPlan();
      } catch {
        this.planActivo = null;
      }
    }
  }

  cargarEjerciciosDelPlan(): void {
    if (!this.planActivo?.entrenamiento) {
      this.ejerciciosDelPlan = [];
      return;
    }

    // Si ya tiene ejercicios cargados
    if (
      this.planActivo.entrenamiento.ejercicios &&
      this.planActivo.entrenamiento.ejercicios.length > 0
    ) {
      this.ejerciciosDelPlan = this.planActivo.entrenamiento.ejercicios;
      return;
    }

    // Si tiene IDs de ejercicios, cargarlos
    if (
      this.planActivo.entrenamiento.ejerciciosIds &&
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
      this.ejerciciosDelPlan = [];
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
    if (this.mostrarSoloPlanActivo && this.ejerciciosDelPlan.length > 0) {
      return this.ejerciciosDelPlan;
    }
    return this.ejercicios;
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
