import { Component } from "@angular/core";
import { Header } from "../../components/header/header";
import { BottomNav } from "../../components/bottom-nav/bottom-nav";

@Component({
  selector: "app-programas",
  imports: [Header, BottomNav],
  templateUrl: "./programas.html",
  styleUrl: "./programas.css",
})
export class Programas {}
