import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadComponent: () => import("../pages/home/home").then((m) => m.Home),
  },
  {
    path: "progreso",
    loadComponent: () => import("../pages/progreso/progreso").then((m) => m.Progreso),
  },
  {
    path: "comunidad",
    loadComponent: () =>
      import("../pages/comunidad/comunidad").then((m) => m.Comunidad),
  },
  {
    path: "programas",
    loadComponent: () =>
      import("../pages/programas/programas").then((m) => m.Programas),
  },
  {
    path: "perfil",
    loadComponent: () => import("../pages/perfil/perfil").then((m) => m.Perfil),
  },
  {
    path: "tienda",
    loadComponent: () => import("../pages/tienda/tienda").then((m) => m.Tienda),
  },
];
