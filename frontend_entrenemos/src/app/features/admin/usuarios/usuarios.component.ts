import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Usuario } from "../../../shared/models/usuario";
import { UsuariosService } from "../../../core/services/usuarios.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-usuarios",
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: "./usuarios.component.html",
  styleUrl: "./usuarios.component.css",
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;
  error: string | null = null;

  constructor(
    private usuarioService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.error = null;

    this.usuarioService.listarUsuarios().subscribe({
      next: (data: Usuario[]) => {
        console.log("Usuarios recibidos:", data);
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando usuarios:", err);
        this.error =
          err.error?.message ||
          "Error al cargar los usuarios. Verifica que tengas rol ADMIN.";
        this.cargando = false;
      },
    });
  }

  eliminar(id: number) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => {
        this.cargarUsuarios();
        alert("Usuario eliminado con éxito");
      },
      error: (err) => {
        console.error("Error eliminando usuario:", err);
        alert(
          "No se pudo eliminar el usuario: " +
            (err.error?.message || "Error desconocido")
        );
      },
    });
  }

  editar(usuario: Usuario) {
    this.router.navigate(["/admin/usuarios", usuario.id]);
  }

  crear() {
    this.router.navigate(["/admin/usuarios/nuevo"]);
  }
}
