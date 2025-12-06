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
  router = inject(Router);

  navegarAProgreso(): void {
    console.log("Navegando a progreso...");
    this.router.navigate(["/progreso"]).then(
      (success) => {
        if (success) {
          console.log("Navegación exitosa a /progreso");
        } else {
          console.error("Error en la navegación a /progreso");
        }
      },
      (error) => {
        console.error("Error navegando a /progreso:", error);
      }
    );
  }
}
