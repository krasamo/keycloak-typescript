export class UserFields {
  public static ID = 'id';
  public static ORIGIN = 'origin';
  public static CREATED_TIMESTAMP = 'createdTimestamp';
  public static USERNAME = 'username';
  public static ENABLED = 'enabled';
  public static TOTP = 'totp';
  public static EMAIL_VERIFIED = 'emailVerified';
  public static FIRST_NAME = 'firstName';
  public static LAST_NAME = 'lastName';
  public static EMAIL = 'email';
  public static FEDERATION_LINK = 'federationLink';
  public static SERVICE_ACCOUNT_CLIENTID = 'serviceAccountClientId';
  public static ATTRIBUTES = 'attributes';
  public static CREDENTIALS = 'credentials';
  public static DISABLE_CREDENTIAL_TYPES = 'disableCredentialTypes';
  public static REQUIRED_ACTIONS = 'requiredActions';
  public static FEDERATED_ENTITIES = 'federatedEntities';
  public static REALM_ROLES = 'realmRoles';
  public static CLIENT_ROLES = 'clientRoles';
  public static CLIENT_CONSENTS = 'clientConsents';
  public static NOT_BEFORE = 'notBefore';
  public static APPLICATION_ROLES = 'applicationRoles';
  public static SOCIAL_LINKS = 'socialLinks';
  public static GROUPS = 'groups';
  public static ACCESS = 'access';

  private static DEFAULT_FIELDS: string[] = [
    UserFields.ID,
    UserFields.USERNAME,
    UserFields.FIRST_NAME,
    UserFields.LAST_NAME,
    UserFields.EMAIL,
    UserFields.ATTRIBUTES,
    UserFields.REALM_ROLES,
    UserFields.CLIENT_ROLES,
    UserFields.APPLICATION_ROLES,
    UserFields.SOCIAL_LINKS
  ];

  public static getDefaultFields(): string[] {
    return this.DEFAULT_FIELDS;
  }
}
