import { RoleRepresentation } from '../../models/role-representation';

export interface IRealmRolesManager {
  getRoles(roleName: string): Promise<RoleRepresentation[]>;
  getRole(realmName: string, roleName: string): Promise<RoleRepresentation>;
}
