import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Entrenamiento } from "../../models/entrenamiento.model";

@Component({
  selector: "app-program-card",
  imports: [CommonModule],
  templateUrl: "./program-card.html",
  styleUrl: "./program-card.css",
})
export class ProgramCard {
  @Input() entrenamiento?: Entrenamiento;
  @Input() nombre?: string; // Mantener compatibilidad
  @Input() detalles?: string;
  @Input() imagen?: string;

  get nombrePrograma(): string {
    return this.entrenamiento?.nombre || this.nombre || "Programa";
  }

  get detallesPrograma(): string {
    if (this.entrenamiento) {
      const partes: string[] = [];
      if (this.entrenamiento.descripcion) {
        partes.push(this.entrenamiento.descripcion);
      }
      if (
        this.entrenamiento.ejercicios &&
        this.entrenamiento.ejercicios.length > 0
      ) {
        partes.push(`${this.entrenamiento.ejercicios.length} ejercicios`);
      }
      return partes.join(" | ") || "Sin detalles";
    }
    return this.detalles || "";
  }

  get imagenPrograma(): string {
    if (this.imagen) {
      return this.imagen;
    }
    const nombre = this.nombrePrograma.toLowerCase();
    if (nombre.includes("trx")) return "trx";
    if (nombre.includes("builder")) return "builder";
    if (nombre.includes("basic")) return "basic";
    return "basic";
  }
}
