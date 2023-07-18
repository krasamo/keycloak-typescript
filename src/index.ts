import { KeycloakLogin } from './models/keycloak-login';
import UserManager from './managers/UserManager';
import TokenManager from './managers/TokenManager';

export default function createKeycloakFacade(
  keycloakData: KeycloakLogin,
  keycloakRealm: string,
  keycloakUrl: string
) {
  const usersUrl = `${keycloakUrl}/auth/admin/realms/${keycloakRealm}/users`;
  const tokenUrl = `${keycloakUrl}/auth/realms/${keycloakRealm}/protocol/openid-connect/token`;

  const userManager = new UserManager(usersUrl);
  new TokenManager(keycloakData, tokenUrl, [userManager]);

  return userManager;
}
