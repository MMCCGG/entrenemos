export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt?: string; // El backend devuelve "jwt"
  token?: string; // Alias para compatibilidad
  rol: string;
}
