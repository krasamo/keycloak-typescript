import { IUserManager } from './Interfaces/IUserManager';
import { User } from '../models/user';
import { HeadersFactory } from '../helpers/headers-factory';
import { requestBuilder } from '../helpers/request-builder';
import { IObserver } from '../observer/IObserver';

export default class UserManager implements IUserManager, IObserver {
  private readonly url: string;
  private accessToken: string;

  constructor() {}

  get = async (userId: string): Promise<User> => {};
  create = async (
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    isTemporaryPassword: boolean
  ): Promise<void> => {
    const headers = HeadersFactory.instance().authorizationHeader(this.token);

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

  getAttributes = async (userId: string): Promise<attribute[]> => {};
  getRealmRoles = async (userId: string): Promise<string[]> => {};
  getClientRoles = async (
    userId: string,
    client: string
  ): Promise<Map<string, string[]>> => {
    //TODO
  };

  addAttributes = async (
    userId: string,
    attributes: attribute[]
  ): Promise<void> => {
    //TODO
  };
  addRealmRoles = async (userId: string, roles: string[]): Promise<void> => {
    //TODO
  };
  addClientRoles = async (
    userId: string,
    client: string,
    roles: string[]
  ): Promise<void> => {
    //TODO
  };

  resetPassword = async (
    userId: string,
    newPassword: string,
    isTemporary: boolean
  ): Promise<void> => {
    const apiConfig = {
      url: `${this.url}/reset-password`,
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
}
