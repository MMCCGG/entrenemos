/**
 * Modelo que corresponde a EjercicioDto del backend
 */
export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  videoUrl?: string;
}
