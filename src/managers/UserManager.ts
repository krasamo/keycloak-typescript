// Interfaces
import { IUserManager } from './Interfaces/IUserManager';
import { IObserver } from '../observer/IObserver';
import { ISubject } from '../observer/ISubject';

// Models
import { UserFields } from '../enums/UserFields';
import { MappingsRepresentation } from '../models/mappings-representation';
import { ClientMappingsRepresentation } from '../models/client-mappings-representation';
import { User } from '../models/user';

// Helpers
import { HeadersFactory } from '../helpers/headers-factory';
import { requestBuilder } from '../helpers/request-builder';

// Managers
import { RealmManager } from './RealmManager';
import { ClientManager } from './ClientManager';

export default class UserManager extends IUserManager implements IObserver {
  private readonly url: string;
  private accessToken: string = '';
  private allowedUserFields: Set<string>;

  private realmManager: RealmManager;
  private clientManager: ClientManager;

  constructor(
    url: string,
    realmManager: RealmManager,
    clientManager: ClientManager,
    allowedUserFields?: string[]
  ) {
    super();

    this.url = url;

    this.allowedUserFields = new Set(
      allowedUserFields ? allowedUserFields : UserFields.getDefaultFields()
    );

    this.clientManager = clientManager;
    this.realmManager = realmManager;
  }

  /**
   *
   * @param queryParameter
   *   - briefRepresentation: Defines whether brief representations are returned
   *   - email: User's email
   *   - emailVerified: whether the email has been verified
   *   - enabled: User is enabled or not
   *   - firstName
   *   - lastName
   * @param queryValue
   * @returns { User[] }
   */

  getUsers = async (
    queryParameter: string,
    queryValue: string
  ): Promise<User[]> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}?${queryParameter}=${queryValue}&exact=true`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig);

    return response.data as User[];
  };

  getUserId = async (username: string): Promise<string> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}?username=${username}&exact=true`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig);

    const userId: string = response.data[0].id;

    return userId;
  };

  get = async (userId: string): Promise<User> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}/${userId}`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig);
    const user = this.trimUserInfo(response.data as User);

    if (
      this.allowedUserFields.has(UserFields.CLIENT_ROLES) ||
      this.allowedUserFields.has(UserFields.REALM_ROLES)
    ) {
      const rolesResponse: MappingsRepresentation = await this.getRoles(userId);

      if (rolesResponse) {
        if (
          this.allowedUserFields.has(UserFields.CLIENT_ROLES) &&
          rolesResponse.clientMappings
        ) {
          user.clientRoles = user.clientRoles ? user.clientRoles : new Map();

          rolesResponse.clientMappings = rolesResponse.clientMappings
            ? new Map(Object.entries(rolesResponse.clientMappings))
            : new Map();

          rolesResponse.clientMappings.forEach(
            (value: ClientMappingsRepresentation, key: string) => {
              user.clientRoles?.set(key, []);

              value.mappings.forEach((roleRepresentation) => {
                user.clientRoles
                  ?.get(key)
                  ?.push(
                    roleRepresentation.name ? roleRepresentation.name : ''
                  );
              });
            }
          );
        }

        if (
          this.allowedUserFields.has(UserFields.REALM_ROLES) ||
          rolesResponse.realmMappings
        ) {
          user.realmRoles = user.realmRoles ? user.realmRoles : [];

          rolesResponse.realmMappings?.forEach((realmMapping) => {
            user.realmRoles?.push(realmMapping.name ? realmMapping.name : '');
          });
        }
      }
    }

    return user;
  };

  create = async (
    email: string,
    username: string,
    enabled: boolean,
    firstName: string,
    lastName: string,
    password: string,
    isTemporaryPassword: boolean,
    verifyEmail: boolean
  ): Promise<string> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: headers,
      body: {
        email: email,
        username: username,
        firstName: firstName,
        lastName: lastName,
        enabled: enabled
      }
    };

    const response = await requestBuilder(apiConfig);

    const userID = response.headers.location.split('/').pop();

    await this.resetPassword(userID, password, isTemporaryPassword);

    if (verifyEmail) await this.sendVerificationMail(userID);

    return userID;
  };

  public async modify(
    userId: string,
    user: User,
    isReplaceOperation: boolean
  ): Promise<User> {
    user = !isReplaceOperation
      ? this.fuseUsers(user, await this.get(userId))
      : user;

    user.attributes = Object.fromEntries(
      user.attributes ? user.attributes : []
    ) as unknown as undefined;

    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}/${userId}`,
      method: 'PUT',
      headers: headers,
      body: user
    };

    await requestBuilder(apiConfig);

    //wait for add roles request
    await this.modifyRoles(userId, user.realmRoles, user.clientRoles);

    return user;
  }

  resetPassword = async (
    userId: string,
    newPassword: string,
    isTemporary: boolean
  ): Promise<void> => {
    const apiConfig = {
      url: `${this.url}/${userId}/reset-password`,
      method: 'PUT',
      headers: HeadersFactory.instance().authorizationHeader(this.accessToken),
      body: {
        type: 'password',
        value: newPassword,
        temporary: isTemporary
      }
    };

    await requestBuilder(apiConfig);
  };

  public forgotPassword = async (userId: string): Promise<void> => {
    const apiConfig = {
      url: `${this.url}/${userId}/execute-actions-email`,
      method: 'PUT',
      headers: HeadersFactory.instance().authorizationHeader(this.accessToken),
      body: ['UPDATE_PASSWORD']
    };

    await requestBuilder(apiConfig);
  };

  public sendVerificationMail = async (userId: string) => {
    const apiConfig = {
      url: `${this.url}/${userId}/send-verify-email`,
      method: 'PUT',
      headers: HeadersFactory.instance().authorizationHeader(this.accessToken),
      body: {}
    };

    await requestBuilder(apiConfig);
  };

  update(subject: ISubject, args: string[]) {
    if (args.length > 0) {
      this.accessToken = args[0];
    }
  }

  protected trimUserInfo(user: User): User {
    return {
      id: this.allowedUserFields.has(UserFields.ID) ? user.id : undefined,
      origin: this.allowedUserFields.has(UserFields.ORIGIN)
        ? user.origin
        : undefined,
      createdTimestamp: this.allowedUserFields.has(UserFields.CREATED_TIMESTAMP)
        ? user.createdTimestamp
        : undefined,
      username: this.allowedUserFields.has(UserFields.USERNAME)
        ? user.username
        : undefined,
      enabled: this.allowedUserFields.has(UserFields.ENABLED)
        ? user.enabled
        : undefined,
      totp: this.allowedUserFields.has(UserFields.TOTP) ? user.totp : undefined,
      emailVerified: this.allowedUserFields.has(UserFields.EMAIL_VERIFIED)
        ? user.emailVerified
        : undefined,
      firstName: this.allowedUserFields.has(UserFields.FIRST_NAME)
        ? user.firstName
        : undefined,
      lastName: this.allowedUserFields.has(UserFields.LAST_NAME)
        ? user.lastName
        : undefined,
      email: this.allowedUserFields.has(UserFields.EMAIL)
        ? user.email
        : undefined,
      federationLink: this.allowedUserFields.has(UserFields.FEDERATION_LINK)
        ? user.federationLink
        : undefined,
      serviceAccountClientId: this.allowedUserFields.has(
        UserFields.SERVICE_ACCOUNT_CLIENTID
      )
        ? user.serviceAccountClientId
        : undefined,
      attributes: this.allowedUserFields.has(UserFields.ATTRIBUTES)
        ? user.attributes
          ? new Map(Object.entries(user.attributes))
          : undefined
        : undefined,
      credentials: this.allowedUserFields.has(UserFields.CREDENTIALS)
        ? user.credentials
        : undefined,
      disableableCredentialTypes: this.allowedUserFields.has(
        UserFields.DISABLE_CREDENTIAL_TYPES
      )
        ? user.disableableCredentialTypes
        : undefined,
      requiredActions: this.allowedUserFields.has(UserFields.REQUIRED_ACTIONS)
        ? user.requiredActions
        : undefined,
      federatedIdentities: this.allowedUserFields.has(
        UserFields.FEDERATED_ENTITIES
      )
        ? user.federatedIdentities
        : undefined,
      realmRoles: this.allowedUserFields.has(UserFields.REALM_ROLES)
        ? user.realmRoles
        : undefined,
      clientRoles: this.allowedUserFields.has(UserFields.CLIENT_ROLES)
        ? user.clientRoles
          ? new Map(user.clientRoles)
          : undefined
        : undefined,
      clientConsents: this.allowedUserFields.has(UserFields.CLIENT_CONSENTS)
        ? user.clientConsents
        : undefined,
      notBefore: this.allowedUserFields.has(UserFields.NOT_BEFORE)
        ? user.notBefore
        : undefined,
      applicationRoles: this.allowedUserFields.has(UserFields.APPLICATION_ROLES)
        ? user.applicationRoles
          ? new Map(user.applicationRoles)
          : undefined
        : undefined,
      socialLinks: this.allowedUserFields.has(UserFields.SOCIAL_LINKS)
        ? user.socialLinks
        : undefined,
      groups: this.allowedUserFields.has(UserFields.GROUPS)
        ? user.groups
        : undefined,
      access: this.allowedUserFields.has(UserFields.ACCESS)
        ? user.access
          ? new Map(user.access)
          : undefined
        : undefined
    };
  }

  protected fuseUsers(a: User, b: User): User {
    //fuse only types that can be fused ex: append an array to another

    if (a.attributes && b.attributes) {
      b.attributes.forEach((value: string[], key: string) => {
        if (a.attributes!.has(key))
          a.attributes!.set(key, a.attributes!.get(key)!.concat(value));
        else a.attributes!.set(key, value);
      });
    } else if (b.attributes) {
      a.attributes = b.attributes;
    }

    a.disableableCredentialTypes = a.disableableCredentialTypes
      ? b.disableableCredentialTypes
        ? new Set([
            ...a.disableableCredentialTypes,
            ...b.disableableCredentialTypes
          ])
        : a.disableableCredentialTypes
      : b.disableableCredentialTypes;

    a.realmRoles = a.realmRoles
      ? b.realmRoles
        ? a.realmRoles.concat(b.realmRoles)
        : b.realmRoles
      : a.realmRoles;

    if (a.clientRoles && b.clientRoles) {
      b.clientRoles.forEach((value: string[], key: string) => {
        if (a.clientRoles!.has(key))
          a.clientRoles!.set(key, a.clientRoles!.get(key)!.concat(value));
        else a.clientRoles!.set(key, value);
      });
    } else if (b.clientRoles) {
      a.clientRoles = b.clientRoles;
    }

    if (a.applicationRoles && b.applicationRoles) {
      b.applicationRoles.forEach((value: string[], key: string) => {
        if (a.applicationRoles!.has(key))
          a.applicationRoles!.set(
            key,
            a.applicationRoles!.get(key)!.concat(value)
          );
        else a.applicationRoles!.set(key, value);
      });
    } else if (b.applicationRoles) {
      a.applicationRoles = b.applicationRoles;
    }

    a.groups = a.groups
      ? b.groups
        ? a.groups.concat(b.groups)
        : b.groups
      : a.groups;

    if (a.access && b.access) {
      b.access.forEach((value: boolean, key: string) => {
        if (!a.access!.has(key)) a.access!.set(key, value);
      });
    } else if (b.access) {
      a.access = b.access;
    }

    return a;
  }

  protected async getRoles(userId: string): Promise<never> {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}/${userId}/role-mappings`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig);

    return response?.data as never;
  }

  protected async modifyRoles(
    userId: string,
    realmRoles?: string[],
    clientRoles?: Map<string, string[]>
  ): Promise<void> {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    if (realmRoles) {
      const realmsBody: { id: string; name: string }[] = [];

      const realmRolesList = await this.realmManager.getRoles(
        'master',
        realmRoles
      );

      realmRolesList.forEach((role) => {
        realmsBody.push({ id: role.id ?? '', name: role.name ?? '' });
      });

      const apiConfig = {
        url: `${this.url}/${userId}/role-mappings/realm`,
        method: 'POST',
        headers: headers,
        body: realmsBody
      };

      await requestBuilder(apiConfig);
    }

    if (clientRoles) {
      for (const [key, value] of clientRoles) {
        const clientsBody: { id: string; name: string }[] = [];
        const clientId = (await this.clientManager.get('master', key)).id;

        for (const role of value) {
          const roleId = (
            await this.clientManager.getRole('master', clientId, role)
          ).id;

          clientsBody.push({ id: roleId ? roleId : '', name: role });
        }

        const apiConfig = {
          url: `${this.url}/${userId}/role-mappings/clients/${clientId}`,
          method: 'POST',
          headers: headers,
          body: clientsBody
        };

        await requestBuilder(apiConfig);
      }
    }
  }
}
