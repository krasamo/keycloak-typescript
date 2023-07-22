export interface ClientRepresentation {
  id: string;
  clientId: string;
  name: string;
  description: string;
  baseUrl: string;
  surrogateAuthRequired: boolean;
  enabled: boolean;
  alwaysDisplayInConsole: boolean;
  clientAuthenticatorType: string;
}
