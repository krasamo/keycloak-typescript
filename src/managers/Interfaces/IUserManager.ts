import { User } from '../../models/user';
import { Attribute } from '../../models/attribute';

export interface IUserManager {
  get(userId: string): Promise<User>;
  create(
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    isTemporaryPassword: boolean
  ): Promise<void>;

  getAttributes(userId: string): Promise<Attribute[]>;
  getRealmRoles(userId: string): Promise<string[]>;
  getClientRoles(userId: string): Promise<Map<string, string[]>>;

  addAttributes(userId: string, attributes: Attribute[]): Promise<void>;
  addRealmRoles(userId: string, roles: string[]): Promise<void>;
  addClientRoles(
    userId: string,
    client: string,
    roles: string[]
  ): Promise<void>;

  resetPassword(
    userId: string,
    newPassword: string,
    isTemporary: boolean
  ): Promise<void>;
}
