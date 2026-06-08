import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private keycloak!: Keycloak;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private initialized = false;
  private apiToken: string | null = null;

  init(): Promise<boolean> {
    if (this.initialized) {
      return Promise.resolve(true);
    }

    if (!this.keycloak) {
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      });
    }

    return this.keycloak
      .init(environment.keycloak.initOptions)
      .then((authenticated) => {
        this.initialized = true;

        if (authenticated) {
          this.startTokenRefresh();
        }

        return authenticated;
      })
      .catch((error) => {
        console.error('[Keycloak] Init error:', error);
        return false;
      });
  }

  login() {
    this.keycloak.login();
  }

  logout() {
    this.stopTokenRefresh();
    this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  getToken(): string | null {
    return this.keycloak?.token ?? null;
  }

  getUserProfile() {
    if (!this.keycloak?.tokenParsed) return null;

    const token: any = this.keycloak.tokenParsed;

    console.log(this.keycloak.tokenParsed);

    return {
      username: token.preferred_username,
      email: token.email,
      name: token.name,
      avatar:token.avatarUrl?? '',
    };
  }

  private startTokenRefresh() {
    this.stopTokenRefresh();

    this.refreshInterval = setInterval(() => {
      this.keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            console.log('🔄 Token renovado');
          }
        })
        .catch(() => {
          console.warn('❌ Token expirado. Redirecionando...');
          this.stopTokenRefresh();
          this.login();
        });
    }, 10_000);
  }

  private stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  setApiToken(token: string) {
    this.apiToken = token;
  }

  getApiToken(): string | null {
    return this.apiToken;
  }
}
