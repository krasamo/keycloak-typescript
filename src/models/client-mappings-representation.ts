// Models
import { RoleRepresentation } from './role-representation';

export interface ClientMappingsRepresentation {
  id: string;
  client: string;
  mappings: RoleRepresentation[];
}
