import { Routes } from '@angular/router';
import { FornecedorComponent } from './fornecedor.component';
import { permissionGuard } from '../security/guards/permission.guard';
import { PERMISSOES } from '../security/model/permissoes';

export const FORNECEDOR_ROUTES: Routes = [
  {
    path: '',
    canActivateChild: [permissionGuard],
    children: [
      {
        path: '',
        data: { permissao: PERMISSOES.FORNECEDOR.VISUALIZAR },
        component: FornecedorComponent,
      },
      {
        path: 'create',
        data: { permissao: PERMISSOES.FORNECEDOR.CRIAR },
        loadComponent: () =>
          import('./pages/create/create.component').then((m) => m.CreateComponent),
      },
      {
        path: 'edit/:fornecedorId',
        data: { permissao: PERMISSOES.FORNECEDOR.EDITAR },
        loadComponent: () => import('./pages/edit/edit.component').then((m) => m.EditComponent),
      },
    ],
  },
];
