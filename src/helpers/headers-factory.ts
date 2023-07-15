import { IHeadersFactory } from './interfaces/iHeadersFactory';

export class HeadersFactory implements IHeadersFactory {
  private static factoryInstance: HeadersFactory;

  private constructor() {}

  public static instance(): HeadersFactory {
    if (this.factoryInstance == null)
      this.factoryInstance = new HeadersFactory();
    return this.factoryInstance;
  }

  authorizationHeader(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` };
  }
}
