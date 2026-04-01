import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
 // apiUrl: 'https://api.cluster.stringtecnologiadf.org',// O host definido no ingress.yml
  apiUrl: 'http://localhost:8080/api',
  keycloak: {
    url: 'https://auth.stringtecnologiadf.org',
    realm: 'stringtecnologia',
    clientId: 'frontend-spa',
    initOptions: {
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false
    }
  }
};