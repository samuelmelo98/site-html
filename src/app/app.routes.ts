import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'cliente',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/cliente/cliente.routes')
        .then(m => m.CLIENTE_ROUTES)
  },
  {
    path: 'users',
    canActivate: [authGuard ],
    loadChildren: () =>
      import('./features/users/users.routes')
        .then(m => m.USERS_ROUTES)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
  path: 'validacao/:codigo',
  loadComponent: () =>
    import('./features/validacao/validacao-component')
      .then(m => m.ValidacaoComponent)
}
];
