import { Component } from "@angular/core";
import { Header } from "../../../shared/components/header/header";
import { BottomNav } from "../../../shared/components/bottom-nav/bottom-nav";

@Component({
  selector: "app-tienda",
  imports: [Header, BottomNav],
  templateUrl: "./tienda.html",
  styleUrl: "./tienda.css",
})
export class Tienda {}
