import {
  Routes,
} from '@angular/router';

import {
  ClienteComponent,
} from './cliente.component';

import {
  permissionGuard,
} from '../security/guards/permission.guard';

import {
  PERMISSOES,
} from '../security/model/permissoes';

export const CLIENTE_ROUTES: Routes = [

  {
    path: '',

    canActivateChild: [
      permissionGuard,
    ],

    children: [

      {
        path: '',

        data: {
          permissao:
            PERMISSOES.CLIENTE.VISUALIZAR,
        },

        component:
          ClienteComponent,
      },

      {
        path: 'create',

        data: {
          permissao:
            PERMISSOES.CLIENTE.CRIAR,
        },

        loadComponent: () =>
          import(
            './pages/create/create.component'
          ).then(
            m => m.CreateComponent,
          ),
      },

      {
        path: 'edit/:clienteId',

        data: {
          permissao:
            PERMISSOES.CLIENTE.EDITAR,
        },

        loadComponent: () =>
          import(
            './pages/edit/edit.component'
          ).then(
            m => m.EditComponent,
          ),
      },

    ],
  },

];