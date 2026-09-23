import { Routes } from '@angular/router';

export const ORDEM_SERVICO_ROUTES: Routes = [

  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detail/detail.component')
        .then(m => m.DetailComponent)
  }

];