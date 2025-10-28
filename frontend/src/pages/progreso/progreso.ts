import { Component } from "@angular/core";
import { Header } from "../../components/header/header";
import { BottomNav } from "../../components/bottom-nav/bottom-nav";

@Component({
  selector: "app-progreso",
  imports: [Header, BottomNav],
  templateUrl: "./progreso.html",
  styleUrl: "./progreso.css",
})
export class Progreso {}
