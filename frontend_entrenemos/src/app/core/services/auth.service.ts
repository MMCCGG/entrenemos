import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import { LoginRequest, LoginResponse } from "../../shared/models/auth.model";
import { Usuario } from "../../shared/models/usuario";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${API_BASE_URL}/auth`;

  // Signals para el token y rol (Angular 20)
  private tokenSignal = signal<string | null>(null);
  public token = this.tokenSignal.asReadonly();

  private rolSignal = signal<string | null>(null);
  public rol = this.rolSignal.asReadonly();

  constructor() {
    // Cargar token del localStorage al iniciar
    const savedToken = localStorage.getItem("token");
    const savedRol = localStorage.getItem("rol");
    if (savedToken) {
      this.tokenSignal.set(savedToken);
      this.rolSignal.set(savedRol);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { email, password };
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          // El backend devuelve "jwt" o "token"
          const token = response.jwt || response.token || "";
          this.tokenSignal.set(token);
          this.rolSignal.set(response.rol);
          localStorage.setItem("token", token);
          localStorage.setItem("rol", response.rol);
        })
      );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.rolSignal.set(null);
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    this.router.navigate(["/login"]);
  }

  isAuthenticated(): boolean {
    return this.tokenSignal() !== null;
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getRol(): string | null {
    return this.rolSignal();
  }

  // Métodos legacy para compatibilidad
  guardarToken(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem("token", token);
  }

  guardarRol(rol: string): void {
    this.rolSignal.set(rol);
    localStorage.setItem("rol", rol);
  }

  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
  }
}
