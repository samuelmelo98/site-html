import { Routes } from '@angular/router';

export const APARELHO_ROUTES: Routes = [
  {
    path: ':clienteId',
    loadComponent: () =>
      import('./aparelho.component').then((m) => m.AparelhoComponent),
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
    path: 'create/:clienteId',
    loadComponent: () =>
      import('./pages/create/create.component').then((m) => m.CreateComponent),
  },
];
