/**
 * Modelo para representar un plan de entrenamiento asignado a un usuario
 */
import { Entrenamiento } from "./entrenamiento.model";
import { Usuario } from "./usuario";

export interface PlanUsuario {
  id?: number;
  usuarioId: number;
  entrenamientoId: number;
  fechaInicio: string; // ISO date string
  fechaFin?: string; // ISO date string (calculado)
  activo: boolean;
  entrenamiento?: Entrenamiento; // Datos completos del entrenamiento
  usuario?: Usuario; // Datos del usuario
  ejerciciosCompletados?: number[]; // IDs de ejercicios completados
  fechaUltimaSesion?: string; // ISO date string
}

export interface PlanDisponible {
  entrenamiento: Entrenamiento;
  duracionDias: number;
  dificultad?: "Principiante" | "Intermedio" | "Avanzado";
  categoria?: string;
}



