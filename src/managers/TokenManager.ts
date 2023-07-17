import { ITokenManager } from './Interfaces/ITokenManager';
import { requestBuilder } from '../helpers/request-builder';

export default class TokenManager extends ITokenManager {
  private readonly url: string;
  private accessToken: string;
  private refreshToken: string;
  private accessTokenExpireTime: number;
  private refreshTokenExpireTime: number;
  private clientId: string;
  private clientSecret?: string;

  constructor(
    url: string,
    clientId: string,
    username: string,
    password: string,
    clientSecret?: string
  ) {
    super();

    this.url = url;
    this.clientSecret = clientSecret;
    this.clientId = clientId;

    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: {},
      body: {
        client_id: this.clientId,
        username: username,
        password: password,
        clientSecret: this.clientSecret,
        grant_type: 'password'
      }
    };

    this.makeRefreshRequest(apiConfig);
  }

  protected makeRefreshRequest = async (apiConfig: {
    url;
    method;
    headers;
    body;
  }): Promise<void> => {
    const response = await requestBuilder(apiConfig);

    this.accessToken = response?.data.access_token;
    this.refreshToken = response?.data.refresh_token;
    this.accessTokenExpireTime = response?.data.expires_in;
    this.refreshTokenExpireTime = response?.data.refresh_expires_in;
  };

  protected refreshAccessToken = async (): Promise<void> => {
    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: {},
      body: {
        client_id: this.clientId,
        clientSecret: this.clientSecret,
        grant_type: 'refresh_token'
      }
    };

    await this.makeRefreshRequest(apiConfig);
  };

  protected notify = (): void => {};
}
