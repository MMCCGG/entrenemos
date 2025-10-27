import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-program-card",
  imports: [CommonModule],
  templateUrl: "./program-card.html",
  styleUrl: "./program-card.css",
})
export class ProgramCard {
  @Input() nombre: string = "";
  @Input() detalles: string = "";
  @Input() imagen: string = "";
}
