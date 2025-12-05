import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', 
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },

      { path: 'usuarios', 
        loadComponent: () => import('./usuarios/usuarios.component')
          .then(m => m.UsuariosComponent)
      },

      { path: 'usuarios/nuevo', 
        loadComponent: () => import('./usuarios/form/form-usuario.component')
          .then(m => m.FormUsuarioComponent)
      },

      { path: 'usuarios/:id', 
        loadComponent: () => import('./usuarios/form/form-usuario.component')
          .then(m => m.FormUsuarioComponent)
      },

      { path: 'programas', 
        loadComponent: () => import('./programas/programas.component')
          .then(m => m.ProgramasComponent)
      },

      { path: 'comunidad', 
        loadComponent: () => import('./comunidad/comunidad.component')
          .then(m => m.ComunidadComponent)
      },

      { path: 'progreso', 
        loadComponent: () => import('./progreso/progreso.component')
          .then(m => m.ProgresoComponent)
      },

      { path: 'configuracion', 
        loadComponent: () => import('./configuracion/configuracion.component')
          .then(m => m.ConfiguracionComponent)
      }
    ]
  }
];