import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import { Usuario } from "../../shared/models/usuario";

@Injectable({
  providedIn: "root",
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/usuarios`;

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  subirFotoPerfil(
    id: number,
    file: File
  ): Observable<{ usuario: Usuario; fotoPerfil: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post<{ usuario: Usuario; fotoPerfil: string }>(
      `${this.apiUrl}/${id}/foto-perfil`,
      formData
    );
  }
}
