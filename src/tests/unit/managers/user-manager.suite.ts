/*import { describe, expect, it, beforeEach } from '@jest/globals';
import { mock, mockReset } from 'jest-mock-extended';
import UserManager from '../../../managers/UserManager';
import { User } from '../../../models/user';

export const userManagerTestSuite = () => {
  describe('User Manager Unit Tests', () => {
    let manager: UserManager;

    beforeAll(() => {
      manager = new UserManager('fake url');
    });

    it('should be defined', () => {
      expect(manager).toBeDefined();
    });

    describe('get User', () => {
      const fakeApiConfig = {
        url: 'fakeurl',
        method: 'GET',
        headers: '',
        body: {}
      };

      const testUser: User = {
        id: '014812sa-1826434b',
        origin: 'unknown',
        createdTimestamp: '1972398712874',
        username: 'Don Pepe',
        enabled: true,
        totp: undefined,
        emailVerified: false,
        firstName: 'Jose',
        lastName: 'Gutierrez',
        email: 'pepeplax@yopmail.com',
        federationLink: undefined,
        serviceAccountClientId: '128937819',
        attributes: {
          country: ['mx'],
          phone: ['123456789'],
          ya_jala: ['porfavor'],
          hola: ['adios'],
          muchas_gracias: ['ya funcionaste'],
          ya_no_se: ['que', 'poner']
        }
      };
    });
  });
};

/* get(userId: string): Promise<User>;
  create(
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    isTemporaryPassword: boolean
  ): Promise<void>;

  getAttributes(userId: string): Promise<Attribute[]>;
  getRealmRoles(userId: string): Promise<string[]>;
  getClientRoles(userId: string): Promise<Map<string, string[]>>;

  addAttributes(userId: string, attributes: Attribute[]): Promise<void>;
  addRealmRoles(userId: string, roles: string[]): Promise<void>;
  addClientRoles(
    userId: string,
    client: string,
    roles: string[]
  ): Promise<void>;

  resetPassword(
    userId: string,
    newPassword: string,
    isTemporary: boolean
  ): Promise<void>;*/
