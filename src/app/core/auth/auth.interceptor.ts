import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { LoaderService } from '../layout/ui/services/loader.service'; 
import { finalize } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);
  //const loader = inject(LoaderService); // se você usa loader

  const apiToken = keycloak.getApiToken();
  const keycloakToken = keycloak.getToken();

  const token = apiToken ?? keycloakToken;

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
