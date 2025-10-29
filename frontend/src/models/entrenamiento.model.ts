/**
 * Modelo que corresponde a EntrenamientoDto del backend
 */
export interface Entrenamiento {
  id?: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string; // ISO date string (LocalDate en backend)
  fechaFin: string; // ISO date string (LocalDate en backend)
  ejerciciosIds: number[];
}
