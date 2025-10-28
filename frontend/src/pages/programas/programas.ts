import { Component } from "@angular/core";
import { Header } from "../header/header";
import { BottomNav } from "../bottom-nav/bottom-nav";

@Component({
  selector: "app-programas",
  imports: [Header, BottomNav],
  templateUrl: "./programas.html",
  styleUrl: "./programas.css",
})
export class Programas {}
