// Interfaces
import { IClientRolesManager } from './Interfaces/IClientRolesManager';
import { IObserver } from '../observer/IObserver';
import { ISubject } from '../observer/ISubject';
import { IClientManager } from './Interfaces/IClientManager';

// Helpers
import { requestBuilder } from '../helpers/request-builder';
import { HeadersFactory } from '../helpers/headers-factory';

// Models
import { RoleRepresentation } from '../models/role-representation';
import { ClientRepresentation } from '../models/client-representation';

export class ClientManager
  implements IClientRolesManager, IClientManager, IObserver
{
  private readonly url: string;
  private accessToken: string;

  constructor(url: string) {
    this.url = url;
    this.accessToken = '';
  }
  getRole = async (
    realmName: string,
    clientId: string,
    roleName: string
  ): Promise<RoleRepresentation> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}/${realmName}/clients/${clientId}/roles/${roleName}`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig);

    return response.data as RoleRepresentation;
  };

  get = async (
    realmName: string,
    clientId: string
  ): Promise<ClientRepresentation> => {
    const headers = HeadersFactory.instance().authAndUrlEncodedHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}/${realmName}/clients?clientId=${clientId}`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig);

    return response.data[0] as ClientRepresentation;
  };

  update(subject: ISubject, args: string[]) {
    if (args.length > 0) {
      this.accessToken = args[0];
    }
  }
}
