import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { environment } from '../../../environments/environment';

export class KeycloakService {

  private static keycloak: Keycloak;
  private static refreshInterval: ReturnType<typeof setInterval> | null = null;


   static init(): Promise<boolean> {
    if (!this.keycloak) {
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });
    }

      const initOptions: KeycloakInitOptions = {
      ...environment.keycloak.initOptions,
      silentCheckSsoRedirectUri:
        window.location.origin + '/assets/silent-check-sso.html'
    };

    return this.keycloak.init(initOptions).then(authenticated => {
      if (authenticated) {
        this.startTokenRefresh();
      }
      return authenticated;
    });
  }
  

  static login() {
    if (!this.keycloak) {
      console.warn('⚠️ Keycloak ainda não inicializado');
      return;
    }
    this.keycloak.login();
  }

  static logout() {
    this.keycloak?.logout();
  }

  static isLoggedIn(): boolean {
    return !!this.keycloak?.authenticated;
  }

  static getToken(): string | undefined {
    return this.keycloak?.token;
  }

    // 👉 NOVO: dados do usuário
    static getUserProfile() {
      if (!this.keycloak?.tokenParsed) {
        return null;
      }

      const token: any = this.keycloak.tokenParsed;

      return {
        username: token.preferred_username,
        email: token.email,
        name: token.name
      };
    }

    private static stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

    private static startTokenRefresh() {
    // Limpa se já existir
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.keycloak.updateToken(30) // tenta renovar se faltar < 30s
        .then(refreshed => {
          if (refreshed) {
            console.log('🔄 Token renovado');
          }
        })
        .catch(() => {
          console.warn('❌ Token expirado. Redirecionando para login...');
          this.stopTokenRefresh();
          this.login();
        });
    }, 10_000); // verifica a cada 10s
  }

}
