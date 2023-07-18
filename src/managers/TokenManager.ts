import { ITokenManager } from './Interfaces/ITokenManager';
import { requestBuilder } from '../helpers/request-builder';
import { KeycloakLogin } from '../models/keycloak-login';
import { IObserver } from '../observer/IObserver';

export default class TokenManager extends ITokenManager {
  private readonly url: string;
  private accessToken: string;
  private refreshToken: string;
  private accessTokenExpireTime: number;
  private refreshTokenExpireTime: number;
  private clientId: string;
  private clientSecret?: string;

  constructor(
    keycloakLogin: KeycloakLogin,
    url: string,
    observers?: IObserver[]
  ) {
    super();

    this.url = url;
    this.clientSecret = keycloakLogin.clientSecret;
    this.clientId = keycloakLogin.clientId;

    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: {},
      body: {
        client_id: this.clientId,
        username: keycloakLogin.username,
        password: keycloakLogin.password,
        clientSecret: this.clientSecret,
        grant_type: 'password'
      }
    };

    //Attaching initial observers if any
    if (observers != undefined)
      this.observers.forEach((observer) => {
        this.attach(observer);
      });

    this.initializeManager(apiConfig);
  }

  protected initializeManager = async (apiConfig: {
    url;
    method;
    headers;
    body;
  }): Promise<void> => {
    await this.makeRefreshRequest(apiConfig);

    //Create timed task to refresh token
    if (this.accessTokenExpireTime > this.refreshTokenExpireTime) {
      setInterval(() => {
        this.refreshAccessToken();
      }, this.refreshTokenExpireTime);
    } else {
      setInterval(() => {
        this.refreshAccessToken();
      }, this.accessTokenExpireTime);
    }
  };

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

    //notify observers about new access token
    this.notify();
  };

  protected refreshAccessToken = async (): Promise<void> => {
    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: {},
      body: {
        client_id: this.clientId,
        clientSecret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      }
    };

    await this.makeRefreshRequest(apiConfig);
  };

  protected notify = (): void => {
    this.observers.forEach((observer) => {
      observer.update(this, [this.accessToken]);
    });
  };
}
