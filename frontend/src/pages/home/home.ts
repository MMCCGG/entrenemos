import { Component } from "@angular/core";
import { Header } from "../header/header";
import { UserProfile } from "../user-profile/user-profile";
import { ProgramCard } from "../program-card/program-card";
import { BottomNav } from "../bottom-nav/bottom-nav";

@Component({
  selector: "app-home",
  imports: [Header, UserProfile, ProgramCard, BottomNav],
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class Home {}
