import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-bottom-nav",
  imports: [CommonModule, RouterModule],
  templateUrl: "./bottom-nav.html",
  styleUrl: "./bottom-nav.css",
})
export class BottomNav {
  private router = inject(Router);
  currentRoute: string = "";

  ngOnInit() {
    this.updateActiveRoute();
  }

  ngDoCheck() {
    this.updateActiveRoute();
  }

  private updateActiveRoute() {
    this.currentRoute = this.router.url;
  }

  isActive(route: string): boolean {
    if (route === "programas") {
      return this.currentRoute === "/programas";
    }
    return (
      this.currentRoute === `/${route}` ||
      (route === "home" && this.currentRoute === "/")
    );
  }
}
