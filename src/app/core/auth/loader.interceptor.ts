import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { KeycloakService } from './keycloak.service';
import { LoaderService } from '../layout/ui/services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {

  const SILENT_URLS = ['/auth/refresh', '/health'];

if (SILENT_URLS.some(url => req.url.includes(url))) {
  return next(req);
}

  const loader = inject(LoaderService);
  loader.show();

  return next(req).pipe(
    finalize(() => loader.hide())
  );
};

