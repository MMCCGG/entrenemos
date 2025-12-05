import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";

/**
 * Guard para proteger rutas que requieren rol de administrador
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.getRol() === "ADMIN") {
    return true;
  }

  // Redirigir al login si no está autenticado o no es admin
  router.navigate(["/login"]);
  return false;
};

