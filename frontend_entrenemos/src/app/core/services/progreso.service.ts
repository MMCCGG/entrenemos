import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import { Progreso } from "../../shared/models/progreso.model";

@Injectable({
  providedIn: "root",
})
export class ProgresoService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/progresos`;

  crear(progreso: Progreso): Observable<Progreso> {
    return this.http.post<Progreso>(this.apiUrl, progreso);
  }

  listar(): Observable<Progreso[]> {
    return this.http.get<Progreso[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Progreso> {
    return this.http.get<Progreso>(`${this.apiUrl}/${id}`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerPorUsuarioYEjercicio(
    usuarioId: number,
    ejercicioId: number
  ): Observable<Progreso[]> {
    const params = new HttpParams()
      .set("usuarioId", usuarioId.toString())
      .set("ejercicioId", ejercicioId.toString());
    return this.http.get<Progreso[]>(this.apiUrl, { params });
  }

  obtenerPorUsuario(usuarioId: number): Observable<Progreso[]> {
    const params = new HttpParams().set("usuarioId", usuarioId.toString());
    return this.http.get<Progreso[]>(this.apiUrl, { params });
  }
}
