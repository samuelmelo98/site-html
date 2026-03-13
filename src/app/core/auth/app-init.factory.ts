import { KeycloakService } from './keycloak.service';

export function initializeKeycloak() {
  return () => {
    console.log('🚀 Inicializando Keycloak...');
    return KeycloakService.init();
  };
}
