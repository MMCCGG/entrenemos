import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api.config";

export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  videoUrl?: string;
}

@Injectable({
  providedIn: "root",
})
export class EjercicioService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/ejercicios`;

  crear(ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(this.apiUrl, ejercicio);
  }

  listar(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Ejercicio> {
    return this.http.get<Ejercicio>(`${this.apiUrl}/${id}`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
