//Interfaces
import { IRealmRolesManager } from './Interfaces/IRealmRolesManager';
import { IObserver } from '../observer/IObserver';
import { ISubject } from '../observer/ISubject';

// Helpers
import { HeadersFactory } from '../helpers/headers-factory';
import { requestBuilder } from '../helpers/request-builder';

// Models
import { RoleRepresentation } from '../models/role-representation';

export class RealmManager implements IRealmRolesManager, IObserver {
  private readonly url: string;
  private accessToken: string;

  constructor(url: string) {
    this.url = url;
    this.accessToken = '';
  }
  getAllRoles = async (realmName: string): Promise<RoleRepresentation[]> => {
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

  getRoles = async (
    realmName: string,
    rolesNames: string[]
  ): Promise<RoleRepresentation[]> => {
    const rolesList: RoleRepresentation[] = await this.getAllRoles(realmName);
    const namesSet: Set<string> = new Set(rolesNames);

    const desiredRoles: RoleRepresentation[] = [];

    rolesList.forEach((role) => {
      if (role.name && namesSet.has(role.name)) desiredRoles.push(role);
    });

    return desiredRoles;
  };

  update(subject: ISubject, args: string[]) {
    if (args.length > 0) {
      this.accessToken = args[0];
    }
  }
}
