// Interfaces
import { ISubject } from '../../observer/ISubject';

// Models
import { KeycloakLogin } from '../../models/keycloak-login';

export abstract class ITokenManager extends ISubject {
  public abstract initializeManager(keycloakLogin: KeycloakLogin): void;
  protected abstract makeRefreshRequest({
    url,
    method = 'get',
    headers = {},
    body
  }): void;
  protected abstract refreshAccessToken(): void;
}
