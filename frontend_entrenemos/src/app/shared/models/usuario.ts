export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  telefono?: string;
  fechaRegistro?: string;
  fotoPerfil?: string;
}
