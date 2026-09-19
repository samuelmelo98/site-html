import { Routes } from '@angular/router';

export const APARELHO_ROUTES: Routes = [
  {
    path: 'create/:clienteId',
    loadComponent: () =>
      import('./pages/create/create.component').then(
        m => m.CreateComponent,
      ),
  },
  {
    path: 'list/:clienteId',
    loadComponent: () =>
      import('./aparelho.component').then(
        m => m.AparelhoComponent,
      ),
  },
  {
    path: 'edit',
    loadComponent: () =>
      import('./pages/edit/edit.component').then(
        m => m.EditComponent,
      ),
  },
  {
    path: ':clienteId',
    loadComponent: () =>
      import('./aparelho.component').then(
        m => m.AparelhoComponent,
      ),
  },
];
