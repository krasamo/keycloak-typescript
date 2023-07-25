// Jest
import { describe, expect, it } from '@jest/globals';
import { mock } from 'jest-mock-extended';

// Managers
import UserManager from '../../../managers/UserManager';
import { RealmManager } from '../../../managers/RealmManager';
import { ClientManager } from '../../../managers/ClientManager';

// Models
import { User } from '../../../models/user';

// Helpers
import * as RequestBuilder from '../../../helpers/request-builder';
import { AxiosHeaders } from 'axios';

export const userManagerTestSuite = () => {
  describe('User Manager Unit Tests', () => {
    const managerMock = mock<UserManager>();
    const realmManagerMock = mock<RealmManager>();
    const clientManagerMock = mock<ClientManager>();

    const requestBuilderMock = jest.spyOn(RequestBuilder, 'requestBuilder');

    const testUser: User = {
      id: '014812sa-1826434b',
      username: 'Don Pepe',
      enabled: true,
      firstName: 'Jose',
      lastName: 'Gutierrez',
      email: 'pepeplax@yopmail.com',
      attributes: new Map([
        ['country', ['mx']],
        ['phone', ['123456789']],
        ['ya_jala', ['porfavor']],
        ['hola', ['adios']],
        ['muchas_gracias', ['ya funcionaste']],
        ['ya_no_se', ['que', 'poner']]
      ]),
      requiredActions: ['an', 'action'],
      realmRoles: ['A', 'Realm', 'Role'],
      clientRoles: new Map([
        ['client1', ['c1r1', 'c1r2']],
        ['client2', ['c2r1', 'c2r2']]
      ])
    };

    it('should be defined', () => {
      expect(managerMock).toBeDefined();
    });

    describe('get', () => {
      it('should return a user without unauthorized fields', async () => {
        requestBuilderMock.mockResolvedValue({
          data: testUser,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: new AxiosHeaders() },
          request: {}
        });

        const expectedUser = testUser;
        expectedUser.enabled = undefined;

        const responseUser = await managerMock.get('12345');

        expect(responseUser).toBe(responseUser);
      });
    });

    describe('modify (Replace)', () => {
      it('Should return the same user that was sent as parameter', async () => {
        const userChanges: User = {
          attributes: new Map([
            ['new', ['shiny']],
            ['old', ['rusty']]
          ]),
          realmRoles: ['a', 'realm'],
          clientRoles: new Map([['client one', ['role one']]])
        };

        const expectedUser = testUser;

        expectedUser.attributes = new Map([
          ...testUser.attributes!.entries(),
          ...userChanges.attributes!.entries()
        ]);
        expectedUser.realmRoles = testUser.realmRoles!.concat(
          userChanges.realmRoles!
        );
        expectedUser.clientRoles = new Map([
          ...testUser.clientRoles!.entries(),
          ...userChanges.clientRoles!.entries()
        ]);

        const responseUser = await managerMock.modify(
          '123',
          userChanges,
          false
        );

        expect(responseUser).toBe(responseUser);
      });
    });

    describe('modify (Non Replace)', () => {
      it('Should return a fused user from parameter and get users', async () => {
        const userChanges: User = {
          attributes: new Map([
            ['new', ['shiny']],
            ['old', ['rusty']]
          ]),
          realmRoles: ['a', 'realm'],
          clientRoles: new Map([['client one', ['role one']]])
        };

        const responseUser = await managerMock.modify('123', userChanges, true);

        expect(responseUser).not.toBe(testUser);
        expect(responseUser).toBe(responseUser);
      });
    });
  });
};
