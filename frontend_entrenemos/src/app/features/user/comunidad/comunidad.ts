import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";
import { ChatWindowComponent } from "../../chat/components/chat-window.component";

@Component({
  selector: "app-comunidad",
  imports: [CommonModule, Header, BottomNav, ChatWindowComponent],
  templateUrl: "./comunidad.html",
  styleUrl: "./comunidad.css",
})
export class Comunidad {}
