import { Component } from "@angular/core";
import { Header } from "../header/header";
import { BottomNav } from "../bottom-nav/bottom-nav";

@Component({
  selector: "app-comunidad",
  imports: [Header, BottomNav],
  templateUrl: "./comunidad.html",
  styleUrl: "./comunidad.css",
})
export class Comunidad {}
