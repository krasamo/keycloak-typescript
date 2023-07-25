// Interfaces
import { IObserver } from '../observer/IObserver';
import { ITokenManager } from './Interfaces/ITokenManager';

// Helpers
import { requestBuilder } from '../helpers/request-builder';

// Models
import { KeycloakLogin } from '../models/keycloak-login';

// External
import * as querystring from 'querystring';

export default class TokenManager extends ITokenManager {
  private readonly url: string;
  private accessToken?: string;
  private refreshToken?: string;
  private accessTokenExpireTime?: number;
  private refreshTokenExpireTime?: number;
  private clientId?: string;
  private clientSecret?: string;

  constructor(url: string, observers?: IObserver[]) {
    super();

    this.url = url;

    //Attaching initial observers if any
    if (observers) {
      observers.forEach((observer) => {
        this.attach(observer);
      });
    }
  }

  public initializeManager = async (
    keycloakLogin: KeycloakLogin
  ): Promise<void> => {
    this.clientSecret = keycloakLogin.clientSecret;
    this.clientId = keycloakLogin.clientId;

    const body = {
      client_id: this.clientId,
      username: keycloakLogin.username,
      password: keycloakLogin.password,
      client_secret: this.clientSecret,
      grant_type: 'password'
    };

    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: {},
      body: querystring.stringify(body)
    };

    await this.makeRefreshRequest(apiConfig);

    //Create timed task to refresh token
    if (
      this.accessTokenExpireTime != undefined &&
      this.refreshTokenExpireTime != undefined
    ) {
      if (this.accessTokenExpireTime > this.refreshTokenExpireTime) {
        setInterval(() => {
          this.refreshAccessToken();
        }, this.refreshTokenExpireTime * 1000);
      } else {
        setInterval(() => {
          this.refreshAccessToken();
        }, this.accessTokenExpireTime * 1000);
      }
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
    const body = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: 'refresh_token'
    };

    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: {},
      body: querystring.stringify(body)
    };

    await this.makeRefreshRequest(apiConfig);
  };

  protected notify = (): void => {
    this.observers.forEach((observer) => {
      observer.update(this, [this.accessToken ? this.accessToken : '']);
    });
  };
}
