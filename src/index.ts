import { KeycloakLogin } from './models/keycloak-login';
import UserManager from './managers/UserManager';
import TokenManager from './managers/TokenManager';
import { RealmManager } from './managers/RealmManager';
import { ClientManager } from './managers/ClientManager';

export default async function createKeycloakFacade(
  keycloakData: KeycloakLogin,
  keycloakRealm: string,
  keycloakUrl: string
): Promise<{ userManager: UserManager }> {
  const usersUrl = `${keycloakUrl}/auth/admin/realms/${keycloakRealm}/users`;
  const tokenUrl = `${keycloakUrl}/auth/realms/${keycloakRealm}/protocol/openid-connect/token`;

  const realmManager = new RealmManager(`${keycloakUrl}/auth/admin/realms`);
  const clientManager = new ClientManager(`${keycloakUrl}/auth/admin/realms`);
  const userManager: UserManager = new UserManager(
    usersUrl,
    realmManager,
    clientManager
  );
  const tokenManager = new TokenManager(tokenUrl, [
    userManager,
    clientManager,
    realmManager
  ]);

  await tokenManager.initializeManager(keycloakData);
  //PENDING URI SCHEME
  return { userManager };
}
