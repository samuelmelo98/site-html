import {
  Routes,
} from '@angular/router';

import {
  ClienteComponent,
} from './cliente.component';

export const CLIENTE_ROUTES: Routes = [

  {
    path: '',
    component: ClienteComponent,
  },

  {
    path: 'create',
    loadComponent: () =>
      import(
        './pages/create/create.component'
      )
        .then(
          m => m.CreateComponent,
        ),
  },

  {
    path: 'edit/:clienteId',
    loadComponent: () =>
      import(
        './pages/edit/edit.component'
      )
        .then(
          m => m.EditComponent,
        ),
  },

];