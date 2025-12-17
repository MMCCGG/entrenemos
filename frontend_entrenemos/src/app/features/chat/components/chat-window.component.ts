import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { WebsocketService } from "../../../core/services/websocket.service";
import {
  IndexedDbService,
  ChatMessage,
} from "../../../core/services/indexed-db.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-chat-window",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chat-window.component.html",
  styleUrls: ["./chat-window.component.css"],
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  messageInput = "";
  private messageSubscription?: Subscription;
  usuarioActual!: { nombre: string; tipo: "USUARIO" | "ADMIN" | "ENTRENADOR" };

  constructor(
    private webSocketService: WebsocketService,
    private db: IndexedDbService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener usuario actual del AuthService
    const nombre = this.authService.getNombre() || "Anon";
    const rol = this.authService.getRol() || "USUARIO";
    const tipo = (
      rol === "ADMIN"
        ? "ADMIN"
        : rol === "ENTRENADOR"
        ? "ENTRENADOR"
        : "USUARIO"
    ) as "USUARIO" | "ADMIN" | "ENTRENADOR";
    this.usuarioActual = { nombre, tipo };

    // Cargar mensajes guardados en IndexedDB
    this.db.getAllMessages().then((msgs) => this.messages.push(...msgs));

    // Suscribirse a mensajes en tiempo real
    this.messageSubscription = this.webSocketService.mensajes$.subscribe(
      (msg) => this.messages.push(msg)
    );
  }

  sendMessage() {
    const text = this.messageInput.trim();
    if (!text) return;

    const msg: ChatMessage = {
      contenido: text,
      tipo: this.usuarioActual.tipo,
      usuario: { nombre: this.usuarioActual.nombre },
      fecha: new Date().toISOString(),
    };

    this.messages.push(msg);
    this.webSocketService.sendMessage(msg);

    this.messageInput = "";
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.webSocketService.closeConnection();
  }

  isString(value: any): value is string {
    return typeof value === "string";
  }
}

