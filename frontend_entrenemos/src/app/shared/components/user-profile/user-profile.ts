import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Usuario } from "../../models/usuario";

@Component({
  selector: "app-user-profile",
  imports: [CommonModule],
  templateUrl: "./user-profile.html",
  styleUrl: "./user-profile.css",
})
export class UserProfile {
  @Input() usuario?: Usuario | null;

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
}
