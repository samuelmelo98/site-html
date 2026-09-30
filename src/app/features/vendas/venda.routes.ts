import {
  Routes,
} from '@angular/router';

import {
  VendaComponent,
} from './venda.component';

export const VENDA_ROUTES: Routes = [
  {
    path: '',
    component: VendaComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'listar',
      },
      {
        path: 'listar',
        loadComponent: () =>
          import(
            './pages/list/list.component'
          ).then(
            m => m.ListComponent,
          ),
      },
      {
        path: 'nova',
        loadComponent: () =>
          import(
            './pages/create/create.component'
          ).then(
            m => m.CreateComponent,
          ),
      },
      {
        path: ':vendaId/editar',
        loadComponent: () =>
          import(
            './pages/create/create.component'
          ).then(
            m => m.CreateComponent,
          ),
      },
      {
        path: ':vendaId',
        loadComponent: () =>
          import(
            './pages/detail/detail.component'
          ).then(
            m => m.DetailComponent,
          ),
      },
    ],
  },
];
