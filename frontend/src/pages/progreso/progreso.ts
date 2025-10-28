import { Component } from "@angular/core";
import { Header } from "../header/header";
import { BottomNav } from "../bottom-nav/bottom-nav";

@Component({
  selector: "app-progreso",
  imports: [Header, BottomNav],
  templateUrl: "./progreso.html",
  styleUrl: "./progreso.css",
})
export class Progreso {}
