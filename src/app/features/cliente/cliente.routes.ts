import { Routes } from '@angular/router';

export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./cliente.component').then((m) => m.ClienteComponent),
  },

  {
    path: 'edit',
    loadComponent: () =>
      import('./pages/edit/edit.component').then((m) => m.EditComponent),
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create/create.component').then((m) => m.CreateComponent),
  },
];
