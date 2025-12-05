/**
 * Modelo que corresponde a EjercicioDto del backend
 */
export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  repeticiones?: number;
  peso?: number;
  tipo?: string;
  videoUrl?: string;
}
