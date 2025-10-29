/**
 * Modelo que corresponde a UsuarioDto del backend
 */
export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  rol?: string; // "ADMIN", "ENTRENADOR", "ATLETA"
}
