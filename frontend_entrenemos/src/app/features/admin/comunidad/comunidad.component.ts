import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ChatWindowComponent } from "../../chat/components/chat-window.component";

@Component({
  selector: "app-comunidad",
  standalone: true,
  imports: [CommonModule, ChatWindowComponent],
  templateUrl: "./comunidad.component.html",
  styleUrl: "./comunidad.component.css",
})
export class ComunidadComponent {}
