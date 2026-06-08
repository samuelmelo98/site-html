export interface KeycloakToken {
  sub: string;
  preferred_username: string;
  name: string;
  email: string;
  email_verified: boolean;

  realm_access?: {
    roles: string[];
  };

  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
}
