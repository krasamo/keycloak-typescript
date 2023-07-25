// Models
import { RoleRepresentation } from '../../models/role-representation';

export interface IRealmRolesManager {
  getAllRoles(roleName: string): Promise<RoleRepresentation[]>;
  getRoles(
    realmName: string,
    rolesNames: string[]
  ): Promise<RoleRepresentation[]>;
}
