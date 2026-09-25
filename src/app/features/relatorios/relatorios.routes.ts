import { Routes } from '@angular/router';

export const RELATORIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/semanal/relatorio-semanal.component')
        .then(m => m.RelatorioSemanalComponent),
  },
];
