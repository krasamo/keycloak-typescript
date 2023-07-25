// Models
import { KeycloakLogin } from './models/keycloak-login';

// Managers
import UserManager from './managers/UserManager';
import TokenManager from './managers/TokenManager';
import { RealmManager } from './managers/RealmManager';
import { ClientManager } from './managers/ClientManager';

export default async function createKeycloakFacade(
  keycloakData: KeycloakLogin,
  keycloakRealm: string,
  keycloakUrl: string,
  isKeycloakVersionHigherOrEqualThan17: boolean
): Promise<{ userManager: UserManager }> {
  const authPath = !isKeycloakVersionHigherOrEqualThan17 ? '/auth' : '';

  const usersUrl = `${keycloakUrl}${authPath}/admin/realms/${keycloakRealm}/users`;
  const tokenUrl = `${keycloakUrl}${authPath}/realms/${keycloakRealm}/protocol/openid-connect/token`;

  const realmManager = new RealmManager(
    `${keycloakUrl}${authPath}/admin/realms`
  );
  const clientManager = new ClientManager(
    `${keycloakUrl}${authPath}/admin/realms`
  );
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
