import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Header } from "../../../../shared/components/header/header";
import { BottomNav } from "../../../../shared/components/bottom-nav/bottom-nav";
import { EntrenamientoService } from "../../../../core/services/entrenamiento.service";
import { Entrenamiento } from "../../../../shared/models/entrenamiento.model";
import { Ejercicio } from "../../../../shared/models/ejercicio.model";

@Component({
  selector: "app-detalle-programa",
  imports: [CommonModule, Header, BottomNav],
  templateUrl: "./detalle-programa.html",
  styleUrl: "./detalle-programa.css",
})
export class DetallePrograma implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private entrenamientoService = inject(EntrenamientoService);

  programa: Entrenamiento | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.cargarPrograma(Number(id));
    } else {
      this.error = "ID de programa no válido";
      this.loading = false;
    }
  }

  cargarPrograma(id: number) {
    this.loading = true;
    this.error = null;

    this.entrenamientoService.obtenerPorId(id).subscribe({
      next: (programa: Entrenamiento) => {
        this.programa = programa;
        this.loading = false;
      },
      error: (err: any) => {
        console.error("Error al cargar programa:", err);
        this.error = "Error al cargar el programa";
        this.loading = false;
      },
    });
  }

  volver() {
    this.router.navigate(["/home"]);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return "No especificada";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fecha;
    }
  }
}
