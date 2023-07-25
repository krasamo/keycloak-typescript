// Models
import { User } from '../../models/user';

export abstract class IUserManager {
  public abstract get(userId: string): Promise<User>;
  protected abstract getRoles(userId: string): Promise<never>;

  public abstract create(
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    isTemporaryPassword: boolean
  ): Promise<void>;

  public abstract modify(
    userId: string,
    user: User,
    isReplaceOperation: boolean
  ): Promise<User>;
  protected abstract modifyRoles(
    userID: string,
    realmRoles?: string[],
    clientRoles?: Map<string, string[]>
  ): Promise<void>;

  protected abstract trimUserInfo(user: User): User;
  protected abstract fuseUsers(a: User, b: User): User;

  public abstract resetPassword(
    userId: string,
    newPassword: string,
    isTemporary: boolean
  ): Promise<void>;
}
