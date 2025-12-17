import { Injectable } from "@angular/core";
import Dexie, { Table } from "dexie";

export interface ChatMessage {
  id?: number;
  contenido: string;
  tipo: "USUARIO" | "ADMIN" | "ENTRENADOR";
  usuario: { nombre: string };
  fecha: string;
}

@Injectable({ providedIn: "root" })
export class IndexedDbService extends Dexie {
  messages!: Table<ChatMessage, number>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      messages: "++id, contenido, tipo, usuario, fecha",
    });
  }

  async addMessage(message: ChatMessage) {
    return await this.messages.add(message);
  }

  async getAllMessages(): Promise<ChatMessage[]> {
    return await this.messages.toArray();
  }

  async clearMessages() {
    return await this.messages.clear();
  }
}
