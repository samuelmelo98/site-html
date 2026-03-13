import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { KeycloakService } from './keycloak.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
   async canActivate(): Promise<boolean> {

    // Se não estiver autenticado, redireciona para login
    if (!KeycloakService.isLoggedIn()) {
      await KeycloakService.login();
      return false;
    }

    return true;
  }
}
