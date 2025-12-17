import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  email: string = "";
  password: string = "";
  error: string = "";

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (usuario) => {
        console.log("Usuario logueado:", usuario);
        console.log("Rol recibido:", usuario.rol);

        // El AuthService ya guarda el token, rol y nombre automáticamente
        if (usuario.rol?.toUpperCase().trim() === "ADMIN") {
          this.router.navigate(["/admin/dashboard"]);
        } else {
          this.router.navigate(["/home"]);
        }
      },
      error: (err) => {
        console.error("Error en login:", err);
        this.error = "Email o contraseña incorrectos";
      },
    });
  }
}
