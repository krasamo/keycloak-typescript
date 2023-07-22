import { ClientRepresentation } from '../../models/client-representation';

export interface IClientManager {
  get(realmName: string, clientId: string): Promise<ClientRepresentation>;
}
