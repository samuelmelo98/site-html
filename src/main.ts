import {
  registerLocaleData,
} from '@angular/common';

import localePtBr from '@angular/common/locales/pt';

import {
  bootstrapApplication,
} from '@angular/platform-browser';

import {
  AppComponent,
} from './app/app.component';

import {
  appConfig,
} from './app/app.config';


registerLocaleData(
  localePtBr,
  'pt-BR',
);


bootstrapApplication(
  AppComponent,
  appConfig,
)
  .catch(
    err =>
      console.error(err),
  );