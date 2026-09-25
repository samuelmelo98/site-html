import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [

  /*
   * ROTAS PÚBLICAS
   */

  {
    path: 'consulta/os/:numero',
    loadComponent: () =>
      import(
        './features/consulta-ordem-servico/pages/consulta-ordem-servico.component'
      )
        .then(m => m.ConsultaOrdemServicoComponent),
  },

  {
    path: 'validacao/:codigo',
    loadComponent: () =>
      import('./features/validacao/validacao-component')
        .then(m => m.ValidacaoComponent),
  },

  /*
   * ROTAS AUTENTICADAS
   */

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent),
  },

  {
  path: 'relatorios',
  canActivate: [authGuard],
  loadChildren: () =>
    import('./features/relatorios/relatorios.routes')
      .then(m => m.RELATORIOS_ROUTES),
},

  {
    path: 'cliente',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/cliente/cliente.routes')
        .then(m => m.CLIENTE_ROUTES),
  },

  {
    path: 'cliente-cpf',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/cliente-cpf/cliente.routes')
        .then(m => m.CLIENTE_ROUTES_CPF),
  },

  {
    path: 'aparelho',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/aparelho/aparelho.routes')
        .then(m => m.APARELHO_ROUTES),
  },

  {
    path: 'users',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/users/users.routes')
        .then(m => m.USERS_ROUTES),
  },

  {
    path: 'ordem-servico',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/ordem-servico/ordem-servico.routes')
        .then(m => m.ORDEM_SERVICO_ROUTES),
  },

  /*
   * ROTA PADRÃO
   */

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

];