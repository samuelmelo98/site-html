import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG, PrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import Nora from '@primeng/themes/nora';
import Lara from '@primeng/themes/lara';
import Material from '@primeng/themes/material';



import { routes } from './app.routes';
import { initializeKeycloak } from './core/auth/app-init.factory';
import { authInterceptor } from './core/auth/auth.interceptor';
import { loaderInterceptor } from './core/auth/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideAppInitializer(() => initializeKeycloak()),

    provideAppInitializer(() => {
      const primeng = inject(PrimeNG);

      primeng.setTranslation({
        firstDayOfWeek: 1,
        dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
        dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
        dayNamesMin: ['D','S','T','Q','Q','S','S'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        today: 'Hoje',
        clear: 'Limpar'
      });
    }),

    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loaderInterceptor
      ])
    ),

    provideAnimationsAsync(),

    providePrimeNG({
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    })
  ]
};