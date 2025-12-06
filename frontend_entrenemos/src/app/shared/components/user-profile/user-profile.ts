import { Component, Input, inject, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Usuario } from "../../models/usuario";
import { UsuariosService } from "../../../core/services/usuarios.service";
import { AuthService } from "../../../core/services/auth.service";
import { API_BASE_URL } from "../../../config/api.config";

@Component({
  selector: "app-user-profile",
  imports: [CommonModule],
  templateUrl: "./user-profile.html",
  styleUrl: "./user-profile.css",
})
export class UserProfile {
  @Input() usuario?: Usuario | null;
  @Output() fotoActualizada = new EventEmitter<Usuario>();

  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);

  subiendo = false;
  error: string | null = null;

  get nombreUsuario(): string {
    return this.usuario?.nombre || "Usuario";
  }

  get detallesUsuario(): string {
    if (!this.usuario) {
      return "Inicia sesión para ver tu perfil";
    }
    const partes: string[] = [];
    if (this.usuario.telefono) {
      partes.push(this.usuario.telefono);
    }
    if (this.usuario.rol) {
      partes.push(this.usuario.rol);
    }
    return partes.join(" | ") || "Miembro";
  }

  get fotoPerfilUrl(): string {
    if (this.usuario?.fotoPerfil) {
      // Si la foto empieza con /uploads/, construir la URL del backend sin /api
      if (this.usuario.fotoPerfil.startsWith("/uploads/")) {
        // Extraer el puerto y host de API_BASE_URL pero sin /api
        const baseUrl = API_BASE_URL.replace("/api", "");
        return `${baseUrl}${this.usuario.fotoPerfil}`;
      }
      return this.usuario.fotoPerfil;
    }
    return "/assets/user-avatar.png";
  }

  onFotoClick(): void {
    if (!this.usuario?.id) {
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.subirFoto(file);
      }
    };
    input.click();
  }

  subirFoto(file: File): void {
    if (!this.usuario?.id) {
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = "La imagen es demasiado grande. Máximo 5MB";
      setTimeout(() => (this.error = null), 3000);
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      this.error = "El archivo debe ser una imagen";
      setTimeout(() => (this.error = null), 3000);
      return;
    }

    this.subiendo = true;
    this.error = null;

    this.usuariosService.subirFotoPerfil(this.usuario.id, file).subscribe({
      next: (response) => {
        if (this.usuario) {
          this.usuario.fotoPerfil = response.fotoPerfil;
          this.fotoActualizada.emit(this.usuario);
        }
        this.subiendo = false;
      },
      error: (err) => {
        console.error("Error subiendo foto:", err);
        this.error = err.error?.error || "Error al subir la foto";
        this.subiendo = false;
        setTimeout(() => (this.error = null), 5000);
      },
    });
  }
}
