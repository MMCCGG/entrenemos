import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { WebSocketSubject, webSocket } from "rxjs/webSocket";
import { IndexedDbService, ChatMessage } from "./indexed-db.service";
import { API_BASE_URL } from "../../config/api.config";

@Injectable({ providedIn: "root" })
export class WebsocketService {
  private socket$: WebSocketSubject<ChatMessage>;
  private mensajesSubject = new Subject<ChatMessage>();
  mensajes$ = this.mensajesSubject.asObservable();

  constructor(private db: IndexedDbService) {
    // Construir URL WebSocket desde API_BASE_URL
    const wsUrl = API_BASE_URL.replace("http://", "ws://")
      .replace("https://", "wss://")
      .replace("/api", "/ws");
    this.socket$ = webSocket(wsUrl);

    this.socket$.subscribe({
      next: async (msg) => {
        // Evitar duplicados: comprobar si ya está en IndexedDB
        const allMsgs = await this.db.getAllMessages();
        const existe = allMsgs.find(
          (m) => m.contenido === msg.contenido && m.fecha === msg.fecha
        );
        if (!existe) {
          this.mensajesSubject.next(msg);
          await this.db.addMessage(msg);
        }
      },
      error: (err) => console.error("WebSocket error", err),
      complete: () => console.log("WebSocket cerrado"),
    });
  }

  sendMessage(message: ChatMessage) {
    this.socket$.next(message);
    this.db.addMessage(message); // Guardar local inmediatamente
  }

  closeConnection() {
    this.socket$.complete();
  }
}

