import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import { Entrenamiento } from "../../shared/models/entrenamiento.model";

@Injectable({
  providedIn: "root",
})
export class EntrenamientoService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/entrenamientos`;

  crear(entrenamiento: Entrenamiento): Observable<Entrenamiento> {
    return this.http.post<Entrenamiento>(this.apiUrl, entrenamiento);
  }

  listar(): Observable<Entrenamiento[]> {
    return this.http.get<Entrenamiento[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Entrenamiento> {
    return this.http.get<Entrenamiento>(`${this.apiUrl}/${id}`);
  }

  actualizar(
    id: number,
    entrenamiento: Entrenamiento
  ): Observable<Entrenamiento> {
    return this.http.put<Entrenamiento>(`${this.apiUrl}/${id}`, entrenamiento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
