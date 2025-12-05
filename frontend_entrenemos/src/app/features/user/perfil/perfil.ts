import { Component } from "@angular/core";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";

@Component({
  selector: "app-perfil",
  imports: [Header, BottomNav],
  templateUrl: "./perfil.html",
  styleUrl: "./perfil.css",
})
export class Perfil {}
