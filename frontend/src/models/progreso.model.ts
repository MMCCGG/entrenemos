/**
 * Modelo que corresponde a ProgresoDto del backend
 */
export interface Progreso {
  id?: number;
  fecha: string; // ISO date string (LocalDate en backend)
  peso?: number; // Double en backend
  repeticiones?: number; // Integer en backend
  tiempo?: number; // Double en backend (segundos)
  usuarioId: number;
  ejercicioId: number;
}
