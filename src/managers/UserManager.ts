import { IUserManager } from './Interfaces/IUserManager';
import { User } from '../models/user';
import { HeadersFactory } from '../helpers/headers-factory';
import { requestBuilder } from '../helpers/request-builder';
import { IObserver } from '../observer/IObserver';
import { ISubject } from '../observer/ISubject';
import { Attribute } from '../models/attribute';
import {
  parseAttributes,
  parseKeycloakAttributes
} from '../helpers/attributes-parser';

export default class UserManager implements IUserManager, IObserver {
  private readonly url: string;
  private accessToken: string;

  constructor(url: string) {
    this.url = url;
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

    return response?.data as User;
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
      this.resetPassword(userID, password, isTemporaryPassword),
      this.sendVerificationMail(userID)
    ]);
  };

  getAttributes = async (userId: string): Promise<Attribute[]> => {
    const userData = await this.get(userId);

    const userAttributes = parseKeycloakAttributes(userData?.attributes);

    return userAttributes;
  };

  getRealmRoles = async (userId: string): Promise<string[]> => {
    const userData = await this.get(userId);

    return userData?.realmRoles;
  };

  getClientRoles = async (userId: string): Promise<Map<string, string[]>> => {
    const userData = await this.get(userId);

    return userData?.clientRoles;
  };

  addAttributes = async (
    userId: string,
    attributes: Attribute[]
  ): Promise<void> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const previousAttributes: Attribute[] = await this.getAttributes(userId);
    const combinedAttributes: Attribute[] =
      previousAttributes.concat(attributes);

    const apiConfig = {
      url: `${this.url}/${userId}`,
      method: 'PUT',
      headers: headers,
      body: {
        attributes: Object.fromEntries(parseAttributes(combinedAttributes))
      }
    };

    await requestBuilder(apiConfig);
  };
  addRealmRoles = async (userId: string, roles: string[]): Promise<void> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const previousRoles: string[] = await this.getRealmRoles(userId);
    const combinedRoles: string[] = previousRoles.concat(roles);

    const apiConfig = {
      url: `${this.url}/${userId}`,
      method: 'PUT',
      headers: headers,
      body: {
        attributes: combinedRoles
      }
    };

    await requestBuilder(apiConfig);
  };
  addClientRoles = async (
    userId: string,
    client: string,
    roles: string[]
  ): Promise<void> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const combinedRoles: Map<string, string[]> = await this.getClientRoles(
      userId
    );
    combinedRoles.set(client, roles);

    const apiConfig = {
      url: `${this.url}/${userId}`,
      method: 'PUT',
      headers: headers,
      body: {
        attributes: Object.fromEntries(combinedRoles)
      }
    };

    await requestBuilder(apiConfig);
  };

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
    if (args.length > 0) {
      this.accessToken = args[0];
    }
  }
}
