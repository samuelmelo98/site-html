import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
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


/*
export const environment = {
  production: false,
  nome_aplicacao: 'Sicad', // Aparecerá no splash screen
  titulo_aplicacao: '.:: MPMT - Sicad ::.',         // <title> do index.html
  descricao_projeto: '', // Aparecerá no rodapé e <meta name="description"> do index.html
  url_api: 'https://teste.mpmt.mp.br/',
  url_base: 'https://teste.mpmt.mp.br/',
  versao: '@VERSAO',
  local: false,
  keycloak: {
    url: 'https://keycloak-hom.mpmt.mp.br',
    realm: 'homolog',
    clientId: 'frontend',

    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/precedentes/assets/silent-check-sso.html',
      checkLoginIframe: false,
      pkceMethod: 'S256',
    } as KeycloakInitOptions
  },
  url_api_endpoint: 'sicad-api',
  url_portal: 'https://teste.mpmt.mp.br/portal-oidc/',
  timeout_mensagem: 5000,
};*/
