import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { WodTimerComponent } from "../../../shared/components/wod-timer/wod-timer";
import { EntrenamientoService } from "../../../core/services/entrenamiento.service";
import { EjercicioService } from "../../../core/services/ejercicio.service";
import { PlanUsuarioService } from "../../../core/services/plan-usuario.service";
import { ProgresoService } from "../../../core/services/progreso.service";
import { AuthService } from "../../../core/services/auth.service";
import { UsuariosService } from "../../../core/services/usuarios.service";
import { Entrenamiento } from "../../../shared/models/entrenamiento.model";
import { Ejercicio } from "../../../shared/models/ejercicio.model";
import {
  PlanUsuario,
  PlanDisponible,
} from "../../../shared/models/plan-usuario.model";
import { Progreso as ProgresoModelo } from "../../../shared/models/progreso.model";
import { Usuario } from "../../../shared/models/usuario";
import { forkJoin, map, of } from "rxjs";

interface EntrenamientoConEjercicios extends Entrenamiento {
  ejercicios: Ejercicio[];
}

@Component({
  selector: "app-programas",
  imports: [CommonModule, FormsModule, Header, BottomNav, WodTimerComponent],
  templateUrl: "./programas.html",
  styleUrl: "./programas.css",
})
export class Programas implements OnInit {
  private entrenamientoService = inject(EntrenamientoService);
  private ejercicioService = inject(EjercicioService);
  private planUsuarioService = inject(PlanUsuarioService);
  private progresoService = inject(ProgresoService);
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  router = inject(Router);

  vistaSeleccionada: "disponibles" | "mi-plan" = "mi-plan";
  planesDisponibles: PlanDisponible[] = [];
  planActivo: PlanUsuario | null = null;
  usuario: Usuario | null = null;
  cargando = false;
  error: string | null = null;
  asignando = false;

  // Variables para el formulario de progreso
  ejercicios: Ejercicio[] = [];
  ejerciciosDelPlan: Ejercicio[] = [];
  ejercicioSeleccionadoId: number | null = null;
  peso: number | null = null;
  repeticiones: number | null = null;
  tiempo: number | null = null;
  fecha: string = new Date().toISOString().split("T")[0];
  guardando = false;
  exito = false;

  ngOnInit(): void {
    this.cargarUsuarioYPlan();
  }

  cambiarVista(vista: "disponibles" | "mi-plan"): void {
    this.vistaSeleccionada = vista;
    if (vista === "disponibles") {
      this.cargarPlanesDisponibles();
    } else {
      this.cargarPlanActivo();
      this.cargarEjercicios();
    }
  }

  cargarUsuarioYPlan() {
    this.cargando = true;
    this.error = null;
    this.cargarUsuario().then(() => {
      if (this.usuario && this.usuario.id) {
        // Cargar según la vista seleccionada por defecto (mi-plan)
        if (this.vistaSeleccionada === "mi-plan") {
          this.cargarPlanActivo();
          this.cargarEjercicios();
        } else {
          this.cargarPlanesDisponibles();
        }
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
            this.cargarEjerciciosDelPlanConPlan(plan);
          } else {
            this.planActivo = plan;
            this.cargando = false;
            if (this.vistaSeleccionada === "mi-plan") {
              this.cargarEjerciciosDelPlan();
              this.cargarEjercicios();
            }
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
        // Cargar ejercicios del plan si estamos en mi-plan
        if (this.vistaSeleccionada === "mi-plan") {
          this.cargarEjerciciosDelPlan();
          this.cargarEjercicios();
        }
      } catch {
        this.planActivo = null;
      }
    } else {
      this.planActivo = null;
    }
    this.cargando = false;
  }

  cargarEjerciciosDelPlanConPlan(plan: PlanUsuario): void {
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
        // Cargar ejercicios del plan para el formulario de progreso
        if (this.vistaSeleccionada === "mi-plan") {
          this.cargarEjerciciosDelPlan();
          this.cargarEjercicios();
        }
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
        // Cargar ejercicios del plan para el formulario de progreso
        this.cargarEjerciciosDelPlan();
        this.cargarEjercicios();

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
      this.ejerciciosDelPlan = [];
    }
  }

  cargarEjercicios(): void {
    this.ejercicioService.listar().subscribe({
      next: (ejercicios) => {
        this.ejercicios = ejercicios;
      },
      error: (err) => {
        console.error("Error cargando ejercicios:", err);
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

    if (!this.usuario?.id) {
      this.error = "No se pudo identificar al usuario";
      return;
    }

    // Preparar datos
    const progreso: ProgresoModelo = {
      fecha: this.fecha,
      peso: this.peso || undefined,
      repeticiones: this.repeticiones || undefined,
      tiempo: this.tiempo || undefined,
      usuarioId: this.usuario.id,
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
          if (this.usuario?.id) {
            localStorage.setItem(
              `plan-activo-${this.usuario.id}`,
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
          if (this.usuario?.id) {
            localStorage.setItem(
              `plan-activo-${this.usuario.id}`,
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

              if (this.usuario?.id) {
                localStorage.setItem(
                  `plan-activo-${this.usuario.id}`,
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

  esPlanActivo(plan: PlanDisponible): boolean {
    if (!this.planActivo || !plan.entrenamiento) return false;
    return this.planActivo.entrenamientoId === plan.entrenamiento.id;
  }
}
