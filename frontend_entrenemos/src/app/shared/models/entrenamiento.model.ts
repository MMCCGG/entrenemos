/**
 * Modelo que corresponde a EntrenamientoDto del backend
 */
import { Ejercicio } from "./ejercicio.model";

export interface Entrenamiento {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string; // ISO date string (LocalDate en backend)
  fechaFin?: string; // ISO date string (LocalDate en backend)
  ejerciciosIds?: number[]; // Para crear/editar
  ejercicios?: Ejercicio[]; // Para mostrar en el front (viene del backend)
}
