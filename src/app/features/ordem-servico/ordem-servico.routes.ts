import {
  Routes,
} from '@angular/router';

export const ORDEM_SERVICO_ROUTES: Routes = [

  {
    path: 'abertas',

    loadComponent: () =>
      import(
        './pages/ordens/ordens-abertas'
      )
        .then(
          m => m.OrdensAbertasComponent,
        ),
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/detail/detail.component'
      )
        .then(
          m => m.DetailComponent,
        ),
  },

];