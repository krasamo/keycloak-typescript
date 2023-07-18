import { ISubject } from '../../observer/ISubject';

export abstract class ITokenManager extends ISubject {
  protected abstract initializeManager({
    url,
    method = 'get',
    headers = {},
    body
  }): void;
  protected abstract makeRefreshRequest({
    url,
    method = 'get',
    headers = {},
    body
  }): void;
  protected abstract refreshAccessToken(): void;
}