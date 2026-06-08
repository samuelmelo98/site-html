import { inject } from '@angular/core';
import { KeycloakService } from './keycloak.service';

export function initializeKeycloak(): Promise<boolean> {
  const keycloakService = inject(KeycloakService);
  return keycloakService.init();
}
