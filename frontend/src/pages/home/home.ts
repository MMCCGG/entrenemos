import { Component } from "@angular/core";
import { Header } from "../../components/header/header";
import { UserProfile } from "../../components/user-profile/user-profile";
import { ProgramCard } from "../../components/program-card/program-card";
import { BottomNav } from "../../components/bottom-nav/bottom-nav";

@Component({
  selector: "app-home",
  imports: [Header, UserProfile, ProgramCard, BottomNav],
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class Home {}
