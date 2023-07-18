import { KeycloakAttributes } from './attribute';

export interface User {
  id?: string;
  origin?: string;
  createdTimestamp?: bigint;
  username?: string;
  enabled?: boolean;
  totp?: boolean;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  federationLink?: string;
  serviceAccountClientId?: string;
  attributes?: KeycloakAttributes;
  credentials?: never;
  disableableCredentialTypes?: Set<string>;
  requiredActions?: string[];
  federatedIdentities?: never;
  realmRoles?: string[];
  clientRoles?: Map<string, string[]>;
  clientConsents?: never;
  notBefore?: number;
  applicationRoles?: Map<string, string[]>;
  socialLinks?: never;
  groups?: string[];
  access?: Map<string, boolean>;
}

//TODO: types of 'never'
