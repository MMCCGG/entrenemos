import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { API_BASE_URL } from "../../config/api.config";
import {
  PlanUsuario,
  PlanDisponible,
} from "../../shared/models/plan-usuario.model";
import { Entrenamiento } from "../../shared/models/entrenamiento.model";

@Injectable({
  providedIn: "root",
})
export class PlanUsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/plan-usuario`;

  /**
   * Asignar un plan de entrenamiento a un usuario
   */
  asignarPlan(
    usuarioId: number,
    entrenamientoId: number
  ): Observable<PlanUsuario> {
    return this.http.post<PlanUsuario>(this.apiUrl, {
      usuarioId,
      entrenamientoId,
      fechaInicio: new Date().toISOString().split("T")[0],
      activo: true,
    });
  }

  /**
   * Obtener el plan activo de un usuario
   */
  obtenerPlanActivo(usuarioId: number): Observable<PlanUsuario | null> {
    return this.http.get<PlanUsuario | null>(
      `${this.apiUrl}/usuario/${usuarioId}/activo`
    );
  }

  /**
   * Obtener todos los planes de un usuario
   */
  obtenerPlanesUsuario(usuarioId: number): Observable<PlanUsuario[]> {
    return this.http.get<PlanUsuario[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  /**
   * Marcar un ejercicio como completado
   */
  marcarEjercicioCompletado(
    planUsuarioId: number,
    ejercicioId: number
  ): Observable<PlanUsuario> {
    return this.http.post<PlanUsuario>(
      `${this.apiUrl}/${planUsuarioId}/ejercicio/${ejercicioId}/completar`,
      {}
    );
  }

  /**
   * Finalizar un plan
   */
  finalizarPlan(planUsuarioId: number): Observable<PlanUsuario> {
    return this.http.put<PlanUsuario>(
      `${this.apiUrl}/${planUsuarioId}/finalizar`,
      {}
    );
  }

  /**
   * Obtener planes disponibles (todos los entrenamientos)
   * Esto es una función helper que usa el EntrenamientoService
   */
  obtenerPlanesDisponibles(): Observable<PlanDisponible[]> {
    // Por ahora, convertimos todos los entrenamientos en planes disponibles
    // En el futuro, esto podría venir de un endpoint específico
    return this.http
      .get<Entrenamiento[]>(`${API_BASE_URL}/entrenamientos`)
      .pipe(
        map((entrenamientos) => {
          return entrenamientos.map((ent) => {
            let duracionDias = 7; // Por defecto
            if (ent.fechaInicio && ent.fechaFin) {
              const inicio = new Date(ent.fechaInicio);
              const fin = new Date(ent.fechaFin);
              duracionDias = Math.ceil(
                (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
              );
            }

            // Estimar dificultad basada en número de ejercicios
            let dificultad: "Principiante" | "Intermedio" | "Avanzado" =
              "Principiante";
            const numEjercicios = ent.ejerciciosIds?.length || 0;
            if (numEjercicios <= 3) {
              dificultad = "Principiante";
            } else if (numEjercicios <= 6) {
              dificultad = "Intermedio";
            } else {
              dificultad = "Avanzado";
            }

            return {
              entrenamiento: ent,
              duracionDias,
              dificultad,
              categoria: "General",
            } as PlanDisponible;
          });
        })
      );
  }

  /**
   * Calcular el progreso de un plan (porcentaje completado)
   */
  calcularProgreso(plan: PlanUsuario): number {
    if (
      !plan.entrenamiento?.ejercicios ||
      plan.entrenamiento.ejercicios.length === 0
    ) {
      return 0;
    }
    const ejerciciosCompletados = plan.ejerciciosCompletados?.length || 0;
    const totalEjercicios = plan.entrenamiento.ejercicios.length;
    return Math.round((ejerciciosCompletados / totalEjercicios) * 100);
  }

  /**
   * Verificar si un ejercicio está completado
   */
  esEjercicioCompletado(plan: PlanUsuario, ejercicioId: number): boolean {
    return plan.ejerciciosCompletados?.includes(ejercicioId) || false;
  }
}
