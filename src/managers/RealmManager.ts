import { IRealmRolesManager } from './Interfaces/IRealmRolesManager';
import { HeadersFactory } from '../helpers/headers-factory';
import { requestBuilder } from '../helpers/request-builder';
import { RoleRepresentation } from '../models/role-representation';
import { IObserver } from '../observer/IObserver';
import { ISubject } from '../observer/ISubject';

export class RealmManager implements IRealmRolesManager, IObserver {
  private readonly url: string;
  private accessToken: string;

  constructor(url: string) {
    this.url = url;
    this.accessToken = '';
  }
  getRoles = async (realmName: string): Promise<RoleRepresentation[]> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}/${realmName}/roles`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig);

    return response.data as RoleRepresentation[];
  };

  getRole = async (
    realmName: string,
    roleName: string
  ): Promise<RoleRepresentation> => {
    const rolesList = await this.getRoles(realmName);

    let desiredRole: RoleRepresentation = {};

    rolesList.forEach((role) => {
      if (role.name == roleName) {
        desiredRole = role;
        return desiredRole;
      }
    });

    return desiredRole;
  };

  update(subject: ISubject, args: string[]) {
    if (args.length > 0) {
      this.accessToken = args[0];
    }
  }
}
