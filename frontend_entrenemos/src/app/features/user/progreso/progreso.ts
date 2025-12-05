import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { WodTimerComponent } from "../../../shared/components/wod-timer/wod-timer";
import { ProgresoService } from "../../../core/services/progreso.service";
import { EjercicioService } from "../../../core/services/ejercicio.service";
import { Progreso as ProgresoModelo } from "../../../shared/models/progreso.model";
import { Ejercicio } from "../../../shared/models/ejercicio.model";

@Component({
  selector: "app-progreso",
  imports: [CommonModule, FormsModule, Header, BottomNav, WodTimerComponent],
  templateUrl: "./progreso.html",
  styleUrl: "./progreso.css",
})
export class Progreso implements OnInit {
  private progresoService = inject(ProgresoService);
  private ejercicioService = inject(EjercicioService);

  // Datos del formulario
  ejercicios: Ejercicio[] = [];
  ejercicioSeleccionadoId: number | null = null;
  peso: number | null = null;
  repeticiones: number | null = null;
  tiempo: number | null = null;
  fecha: string = new Date().toISOString().split("T")[0]; // Fecha actual

  // Usuario hardcodeado (TODO: implementar autenticación)
  usuarioId: number = 1;

  // Estados
  guardando = false;
  exito = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarEjercicios();
  }

  cargarEjercicios(): void {
    this.ejercicioService.listar().subscribe({
      next: (ejercicios) => {
        this.ejercicios = ejercicios;
      },
      error: (err) => {
        console.error("Error cargando ejercicios:", err);
        this.error = "Error al cargar los ejercicios";
      },
    });
  }

  registrarProgreso(): void {
    // Validaciones
    if (!this.ejercicioSeleccionadoId) {
      this.error = "Debes seleccionar un ejercicio";
      return;
    }

    if (!this.peso && !this.repeticiones && !this.tiempo) {
      this.error = "Debes registrar al menos peso, repeticiones o tiempo";
      return;
    }

    // Preparar datos
    const progreso: ProgresoModelo = {
      fecha: this.fecha,
      peso: this.peso || undefined,
      repeticiones: this.repeticiones || undefined,
      tiempo: this.tiempo || undefined,
      usuarioId: this.usuarioId,
      ejercicioId: this.ejercicioSeleccionadoId,
    };

    this.guardando = true;
    this.error = null;
    this.exito = false;

    this.progresoService.crear(progreso).subscribe({
      next: () => {
        this.exito = true;
        this.guardando = false;
        this.resetearFormulario();
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          this.exito = false;
        }, 3000);
      },
      error: (err) => {
        console.error("Error guardando progreso:", err);
        this.error = "Error al guardar el progreso";
        this.guardando = false;
      },
    });
  }

  resetearFormulario(): void {
    this.ejercicioSeleccionadoId = null;
    this.peso = null;
    this.repeticiones = null;
    this.tiempo = null;
    this.fecha = new Date().toISOString().split("T")[0];
  }
}
