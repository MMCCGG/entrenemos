import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Header } from "../../components/header/header";
import { BottomNav } from "../../components/bottom-nav/bottom-nav";
import { EntrenamientoService } from "../../services/entrenamiento.service";
import { EjercicioService } from "../../services/ejercicio.service";
import { Entrenamiento } from "../../models/entrenamiento.model";
import { Ejercicio } from "../../models/ejercicio.model";
import { forkJoin, map, of } from "rxjs";

interface EntrenamientoConEjercicios extends Entrenamiento {
  ejercicios: Ejercicio[];
}

@Component({
  selector: "app-programas",
  imports: [CommonModule, Header, BottomNav],
  templateUrl: "./programas.html",
  styleUrl: "./programas.css",
})
export class Programas implements OnInit {
  private entrenamientoService = inject(EntrenamientoService);
  private ejercicioService = inject(EjercicioService);

  vistaSeleccionada: "diaria" | "semanal" = "diaria";
  entrenamientos: EntrenamientoConEjercicios[] = [];
  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarRutina();
  }

  cambiarVista(vista: "diaria" | "semanal"): void {
    this.vistaSeleccionada = vista;
    this.cargarRutina();
  }

  cargarRutina(): void {
    this.cargando = true;
    this.error = null;

    this.entrenamientoService.listar().subscribe({
      next: (entrenamientos) => {
        const fechaActual = new Date();
        const fechaHoy = new Date(
          fechaActual.getFullYear(),
          fechaActual.getMonth(),
          fechaActual.getDate()
        );

        let entrenamientosFiltrados: Entrenamiento[];

        if (this.vistaSeleccionada === "diaria") {
          // Filtrar entrenamientos activos para hoy
          entrenamientosFiltrados = entrenamientos.filter((ent) => {
            const fechaInicio = new Date(ent.fechaInicio);
            const fechaFin = new Date(ent.fechaFin);
            fechaInicio.setHours(0, 0, 0, 0);
            fechaFin.setHours(23, 59, 59, 999);
            return fechaHoy >= fechaInicio && fechaHoy <= fechaFin;
          });
        } else {
          // Filtrar entrenamientos activos para la semana actual
          const inicioSemana = new Date(fechaHoy);
          inicioSemana.setDate(fechaHoy.getDate() - fechaHoy.getDay()); // Domingo
          const finSemana = new Date(inicioSemana);
          finSemana.setDate(inicioSemana.getDate() + 6); // Sábado
          finSemana.setHours(23, 59, 59, 999);

          entrenamientosFiltrados = entrenamientos.filter((ent) => {
            const fechaInicio = new Date(ent.fechaInicio);
            const fechaFin = new Date(ent.fechaFin);
            return (
              (fechaInicio >= inicioSemana && fechaInicio <= finSemana) ||
              (fechaFin >= inicioSemana && fechaFin <= finSemana) ||
              (fechaInicio <= inicioSemana && fechaFin >= finSemana)
            );
          });
        }

        // Cargar ejercicios para cada entrenamiento
        if (entrenamientosFiltrados.length === 0) {
          this.entrenamientos = [];
          this.cargando = false;
          return;
        }

        const solicitudesEjercicios = entrenamientosFiltrados.map((ent) => {
          if (ent.ejerciciosIds.length === 0) {
            return of({
              ...ent,
              ejercicios: [] as Ejercicio[],
            });
          }

          const observablesEjercicios = ent.ejerciciosIds.map((id) =>
            this.ejercicioService.obtenerPorId(id)
          );

          return forkJoin(observablesEjercicios).pipe(
            map((ejercicios) => ({
              ...ent,
              ejercicios,
            }))
          );
        });

        forkJoin(solicitudesEjercicios).subscribe({
          next: (entrenamientosConEjercicios) => {
            this.entrenamientos =
              entrenamientosConEjercicios as EntrenamientoConEjercicios[];
            this.cargando = false;
          },
          error: (err) => {
            console.error("Error cargando ejercicios:", err);
            this.error = "Error al cargar los ejercicios de los entrenamientos";
            this.cargando = false;
          },
        });
      },
      error: (err) => {
        console.error("Error cargando entrenamientos:", err);
        this.error = "Error al cargar los entrenamientos";
        this.cargando = false;
      },
    });
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}
