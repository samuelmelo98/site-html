import {
  inject,
} from '@angular/core';

import {
  CanActivateFn,
  Router,
} from '@angular/router';

import {
  toObservable,
} from '@angular/core/rxjs-interop';

import {
  filter,
  map,
  take,
} from 'rxjs';

import {
  AuthStore,
} from '../store/auth.store';

export const permissionGuard: CanActivateFn =
  (route) => {

    const authStore =
      inject(AuthStore);

    const router =
      inject(Router);

    const permissao =
      route.data['permissao'] as string | undefined;

    /*
     * Se a rota não declarou permissão,
     * o guard não bloqueia.
     */
    if (!permissao) {
      return true;
    }

    /*
     * Garante que /api/me foi solicitado.
     *
     * carregar() já impede chamadas duplicadas
     * enquanto estiver carregando.
     */
    authStore.carregar();

    /*
     * Se já carregou, decide imediatamente.
     */
    if (authStore.carregado()) {

      return authStore.possuiPermissao(
        permissao
      )
        ? true
        : router.createUrlTree([
            '/acesso-negado',
          ]);

    }

    /*
     * Se /api/me ainda está carregando,
     * aguarda a conclusão.
     */
    return toObservable(
      authStore.carregado
    ).pipe(

      filter(carregado =>
        carregado
      ),

      take(1),

      map(() => {

        if (
          authStore.possuiPermissao(
            permissao
          )
        ) {

          return true;

        }

        return router.createUrlTree([
          '/acesso-negado',
        ]);

      })

    );

  };