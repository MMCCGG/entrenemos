import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api.config";
import { Entrenamiento } from "../models/entrenamiento.model";

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

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
