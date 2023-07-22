import { RoleRepresentation } from './role-representation';
import { ClientMappingsRepresentation } from './client-mappings-representation';

export interface MappingsRepresentation {
  realmMappings?: RoleRepresentation[];
  clientMappings?: Map<string, ClientMappingsRepresentation>;
}
