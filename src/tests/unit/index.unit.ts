import { userManagerTestSuite } from './managers/user-manager.suite';

export const unitTests = () => {
  describe('Unit tests', () => {
    describe('User Manager Unit Tests', () => {
      userManagerTestSuite();
    });
  });
};
