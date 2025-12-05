import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import { Ejercicio } from "../../shared/models/ejercicio.model";

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

  actualizar(id: number, ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.put<Ejercicio>(`${this.apiUrl}/${id}`, ejercicio);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
