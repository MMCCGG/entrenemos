import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Header } from "../../../shared/components/header/header";
import { UserProfile } from "../../../shared/components/user-profile/user-profile";
import { ProgramCard } from "../../../shared/components/program-card/program-card";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { EntrenamientoService } from "../../../core/services/entrenamiento.service";
import { ProgresoService } from "../../../core/services/progreso.service";
import { AuthService } from "../../../core/services/auth.service";
import { Entrenamiento } from "../../../shared/models/entrenamiento.model";
import { Usuario } from "../../../shared/models/usuario";
import { Progreso } from "../../../shared/models/progreso.model";

@Component({
  selector: "app-home",
  imports: [CommonModule, Header, UserProfile, ProgramCard, BottomNav],
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class Home implements OnInit {
  private entrenamientoService = inject(EntrenamientoService);
  private progresoService = inject(ProgresoService);
  private authService = inject(AuthService);
  router = inject(Router);

  programas: Entrenamiento[] = [];
  programasDestacados: Entrenamiento[] = [];
  usuario: Usuario | null = null;
  progresos: Progreso[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.error = null;

    // Cargar programas
    this.entrenamientoService.listar().subscribe({
      next: (programas) => {
        this.programas = programas;
        // Mostrar solo los primeros 3 como destacados
        this.programasDestacados = programas.slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error("Error al cargar programas:", err);
        this.error = "Error al cargar los programas";
        this.loading = false;
      },
    });

    // Cargar datos del usuario actual desde el token
    this.cargarUsuarioActual();
  }

  cargarUsuarioActual() {
    if (!this.authService.isAuthenticated()) {
      console.log("Usuario no autenticado");
      return;
    }

    this.authService.getCurrentUser().subscribe({
      next: (usuario: Usuario) => {
        console.log("Usuario actual cargado:", usuario);
        this.usuario = usuario;
        // Cargar progresos del usuario
        if (usuario.id) {
          this.cargarProgresos(usuario.id);
        }
      },
      error: (err: any) => {
        console.error("Error al cargar usuario actual:", err);
        // Si hay error, el usuario no está autenticado o el token es inválido
        this.usuario = null;
      },
    });
  }

  cargarProgresos(usuarioId: number) {
    this.progresoService.obtenerPorUsuario(usuarioId).subscribe({
      next: (progresos) => {
        this.progresos = progresos;
      },
      error: (err) => {
        console.error("Error al cargar progresos:", err);
      },
    });
  }

  get saludoPersonalizado(): string {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  }

  verDetallePrograma(programa: Entrenamiento) {
    if (programa.id) {
      this.router.navigate(["/rutina", programa.id]);
    }
  }
}
