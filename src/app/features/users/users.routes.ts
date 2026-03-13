import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list.page')
        .then(m => m.UserListPage)
  },
  {
    path: 'cadastrar',
    loadComponent: () =>
      import('./pages/user-create.page')
        .then(m => m.UserCreatePage)
  }
];
