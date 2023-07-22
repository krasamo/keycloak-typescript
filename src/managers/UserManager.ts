import { IUserManager } from './Interfaces/IUserManager';
import { User } from '../models/user';
import { HeadersFactory } from '../helpers/headers-factory';
import { requestBuilder } from '../helpers/request-builder';
import { IObserver } from '../observer/IObserver';
import { ISubject } from '../observer/ISubject';
import { UserFields } from '../enums/UserFields';
import { MappingsRepresentation } from '../models/mappings-representation';
import { ClientMappingsRepresentation } from '../models/client-mappings-representation';
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
    firstName: string,
    lastName: string,
    password: string,
    isTemporaryPassword: boolean
  ): Promise<void> => {
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
        lastName: lastName
      }
    };

    const response = await requestBuilder(apiConfig);

    const userID = response.headers.location.split('/').pop();

    await Promise.allSettled([
      this.resetPassword(userID, password, isTemporaryPassword)
      //this.sendVerificationMail(userID)
    ]);
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

  private sendVerificationMail = async (userId: string) => {
    const apiConfig = {
      url: `${this.url}/${userId}/send-verify-email`,
      method: 'PUT',
      headers: HeadersFactory.instance().authorizationHeader(this.accessToken),
      body: {}
    };

    await requestBuilder(apiConfig);
  };

  update(subject: ISubject, args: string[]) {
    console.log(`Notified usermanager with args: ${args[0]}`);
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

    a.attributes = a.attributes
      ? b.attributes
        ? new Map([...a.attributes.entries(), ...b.attributes.entries()])
        : a.attributes
      : b.attributes;

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

    a.clientRoles = a.clientRoles
      ? b.clientRoles
        ? new Map([...a.clientRoles.entries(), ...b.clientRoles.entries()])
        : a.clientRoles
      : b.clientRoles;

    a.applicationRoles = a.applicationRoles
      ? b.applicationRoles
        ? new Map([
            ...a.applicationRoles.entries(),
            ...b.applicationRoles.entries()
          ])
        : a.applicationRoles
      : b.applicationRoles;

    a.groups = a.groups
      ? b.groups
        ? a.groups.concat(b.groups)
        : b.groups
      : a.groups;

    a.access = a.access
      ? b.access
        ? new Map([...a.access.entries(), ...b.access.entries()])
        : a.access
      : b.access;

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

      for (const role in realmRoles) {
        const roleId = (await this.realmManager.getRole('master', role)).id;

        console.log(`received realm role id: ${roleId}`);

        realmsBody.push({ id: roleId ? roleId : '', name: role });
      }

      /*realmRoles?.forEach(async (role) => {
        const roleId = (await this.realmManager.getRole('master', role)).id;

        console.log(`received realm role id: ${roleId}`);

        realmsBody.push({ id: roleId ? roleId : '', name: role });
      });*/

      const apiConfig = {
        url: `${this.url}/${userId}/role-mappings/realm`,
        method: 'POST',
        headers: headers,
        body: realmsBody
      };

      console.log(realmsBody[0].id);

      await requestBuilder(apiConfig);
    }

    if (clientRoles) {
      clientRoles?.forEach(async (value: string[], key: string) => {
        const clientsBody: { id: string; name: string }[] = [];
        const clientId = (await this.clientManager.get('master', key)).id;

        console.log(`received client id: ${clientId}`);

        for (const role in value) {
          const roleId = (
            await this.clientManager.getRoles('master', clientId, role)
          ).id;

          console.log(`received client role id: ${roleId}`);

          clientsBody.push({ id: roleId ? roleId : '', name: role });
        }

        /*value.forEach(async (role) => {
          const roleId = (
            await this.clientManager.getRoles('master', clientId, role)
          ).id;

          console.log(`received client role id: ${roleId}`);

          clientsBody.push({ id: roleId ? roleId : '', name: role });
        });*/

        const apiConfig = {
          url: `${this.url}/${userId}/role-mappings/clients/${clientId}`,
          method: 'POST',
          headers: headers,
          body: clientsBody
        };

        await requestBuilder(apiConfig);
      });
    }
  }
}
