export type KeycloakOnLoad = 'check-sso' | 'login-required';

export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
    initOptions: {
      onLoad: KeycloakOnLoad;
      pkceMethod: 'S256';
      checkLoginIframe: boolean;
    };
  };
}
