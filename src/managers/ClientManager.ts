import { IClientRolesManager } from './Interfaces/IClientRolesManager';
import { IObserver } from '../observer/IObserver';
import { ISubject } from '../observer/ISubject';
import { HeadersFactory } from '../helpers/headers-factory';
import { RoleRepresentation } from '../models/role-representation';
import { requestBuilder } from '../helpers/request-builder';
import { IClientManager } from './Interfaces/IClientManager';
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
  getRoles = async (
    realmName: string,
    clientId: string,
    roleName: string
  ): Promise<RoleRepresentation> => {
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    //const client_id = (await this.get(realmName, clientId)).id;

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
    const headers = HeadersFactory.instance().authorizationHeader(
      this.accessToken
    );

    const apiConfig = {
      url: `${this.url}/${realmName}/clients`,
      method: 'GET',
      headers: headers,
      body: {}
    };

    const response = await requestBuilder(apiConfig, {
      params: { clientId: clientId }
    });

    console.log(`Received client info: ${response.data}`);

    return response.data as ClientRepresentation;
  };

  update(subject: ISubject, args: string[]) {
    if (args.length > 0) {
      this.accessToken = args[0];
    }
  }
}
