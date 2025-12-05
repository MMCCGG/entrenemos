import { Routes } from "@angular/router";
import { authGuard } from "./app/core/guards/auth.guard";
import { adminGuard } from "./app/core/guards/admin.guard";

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },

  // Rutas públicas
  {
    path: "login",
    loadComponent: () =>
      import("./app/features/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },

  // Rutas de usuario (requieren autenticación)
  {
    path: "home",
    loadComponent: () =>
      import("./app/features/user/home/home").then((m) => m.Home),
    canActivate: [authGuard],
  },
  {
    path: "progreso",
    loadComponent: () =>
      import("./app/features/user/progreso/progreso").then((m) => m.Progreso),
    canActivate: [authGuard],
  },
  {
    path: "comunidad",
    loadComponent: () =>
      import("./app/features/user/comunidad/comunidad").then(
        (m) => m.Comunidad
      ),
    canActivate: [authGuard],
  },
  {
    path: "rutina",
    loadComponent: () =>
      import("./app/features/user/programas/programas").then(
        (m) => m.Programas
      ),
    canActivate: [authGuard],
  },
  {
    path: "rutina/:id",
    loadComponent: () =>
      import(
        "./app/features/user/programas/detalle-programa/detalle-programa"
      ).then((m) => m.DetallePrograma),
    canActivate: [authGuard],
  },
  {
    path: "perfil",
    loadComponent: () =>
      import("./app/features/user/perfil/perfil").then((m) => m.Perfil),
    canActivate: [authGuard],
  },
  {
    path: "tienda",
    loadComponent: () =>
      import("./app/features/user/tienda/tienda").then((m) => m.Tienda),
    canActivate: [authGuard],
  },

  // Rutas de administración (requieren rol ADMIN)
  {
    path: "admin",
    loadChildren: () =>
      import("./app/features/admin/admin.routes").then((m) => m.adminRoutes),
    canActivate: [adminGuard],
  },

  { path: "**", redirectTo: "home" },
];
