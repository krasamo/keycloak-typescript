import { RoleRepresentation } from '../../models/role-representation';

export interface IClientRolesManager {
  getRoles(
    realmName: string,
    clientId: string,
    roleName: string
  ): Promise<RoleRepresentation>;
}
