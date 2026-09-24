import { Routes } from '@angular/router';

export const EDITOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./editor-teste.component').then((m) => m.EditorTesteComponent),
  },

  {
    path: 'edit',
    loadComponent: () =>
      import('./documento-editor.component').then((m) => m.DocumentoEditorComponent),
  },
  // {
  //   path: 'list',
  //   loadComponent: () =>
  //     import('./pages/list/list.component').then((m) => m.ListComponent),
  // },
  // {
  //   path: 'create',
  //   loadComponent: () =>
  //     import('./pages/create/create.component').then((m) => m.CreateComponent),
  // },
];
