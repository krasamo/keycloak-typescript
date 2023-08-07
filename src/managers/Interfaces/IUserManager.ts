// Models
import { User } from '../../models/user';

export abstract class IUserManager {
  public abstract get(userId: string): Promise<User>;
  public abstract getUserId(username: string): Promise<string>;
  protected abstract getRoles(userId: string): Promise<never>;

  public abstract create(
    email: string,
    username: string,
    enabled: boolean,
    firstName: string,
    lastName: string,
    password: string,
    isTemporaryPassword: boolean
  ): Promise<string>;

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
