// Models
import { RoleRepresentation } from '../../models/role-representation';

export interface IClientRolesManager {
  getRole(
    realmName: string,
    clientId: string,
    roleName: string
  ): Promise<RoleRepresentation>;
}
