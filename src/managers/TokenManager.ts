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
  private username?: string;
  private password?: string;
  private refreshIntervalId?: NodeJS.Timeout;
  private requestOfflineAccess: boolean = true;
  private isRefreshing: boolean = false;
  private hasWarnedShortTokens: boolean = false;

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
    this.username = keycloakLogin.username;
    this.password = keycloakLogin.password;
    this.requestOfflineAccess = keycloakLogin.requestOfflineAccess ?? true;

    const body: Record<string, string> = {
      client_id: this.clientId!,
      username: keycloakLogin.username,
      password: keycloakLogin.password,
      grant_type: 'password'
    };

    if (this.clientSecret) {
      body.client_secret = this.clientSecret;
    }

    if (this.requestOfflineAccess) {
      body.scope = 'offline_access';
    }

    const apiConfig = {
      url: this.url,
      method: 'POST',
      headers: {},
      body: querystring.stringify(body)
    };

    await this.makeRefreshRequest(apiConfig);

    this.scheduleTokenRefresh();
  };

  protected makeRefreshRequest = async (apiConfig: {
    url;
    method?: string;
    headers?: Record<string, string>;
    body;
  }): Promise<void> => {
    const { url, method = 'get', headers = {}, body } = apiConfig;

    const response = await requestBuilder({ url, method, headers, body });

    this.accessToken = response?.data.access_token;
    this.refreshToken = response?.data.refresh_token;
    this.accessTokenExpireTime = response?.data.expires_in;
    this.refreshTokenExpireTime = response?.data.refresh_expires_in;

    //notify observers about new access token
    this.notify();
  };

  protected refreshAccessToken = async (): Promise<void> => {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    try {
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

      // Reschedule the refresh based on new expiration times
      this.scheduleTokenRefresh();
    } catch (error) {
      // If refresh token is expired or invalid, re-authenticate with password grant
      // eslint-disable-next-line no-console
      console.error(
        'Token refresh failed, attempting re-authentication:',
        error
      );
      await this.reauthenticateWithPassword();
    } finally {
      this.isRefreshing = false;
    }
  };

  /**
   * Re-authenticate using the password grant type when refresh token expires
   */
  protected reauthenticateWithPassword = async (): Promise<void> => {
    if (!this.username || !this.password) {
      throw new Error(
        'Cannot re-authenticate: username or password not stored'
      );
    }

    try {
      const body: Record<string, string> = {
        client_id: this.clientId!,
        username: this.username,
        password: this.password,
        grant_type: 'password'
      };

      if (this.clientSecret) {
        body.client_secret = this.clientSecret;
      }

      if (this.requestOfflineAccess) {
        body.scope = 'offline_access';
      }

      const apiConfig = {
        url: this.url,
        method: 'POST',
        headers: {},
        body: querystring.stringify(body)
      };

      await this.makeRefreshRequest(apiConfig);

      this.isRefreshing = false;

      this.scheduleTokenRefresh();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Re-authentication failed:', error);
      this.isRefreshing = false;
      throw error;
    }
  };

  /**
   * Schedule token refresh based on the expiration times returned by Keycloak
   */
  protected scheduleTokenRefresh = (): void => {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = undefined;
    }

    if (this.accessTokenExpireTime == undefined) {
      // eslint-disable-next-line no-console
      console.warn(
        'Cannot schedule token refresh: accessTokenExpireTime is undefined'
      );
      return;
    }

    if (!this.hasWarnedShortTokens && this.accessTokenExpireTime < 60) {
      this.hasWarnedShortTokens = true;
      // eslint-disable-next-line no-console
      console.warn(
        'Access token lifespan is very short. This will cause frequent refreshes.',
        {
          accessTokenExpireTime: this.accessTokenExpireTime,
          recommendation:
            'Recommended: at least 1 minute for development, 5+ minutes for production'
        }
      );
    }

    // Use a dynamic margin that's a percentage of token lifetime (min 5s, max 60s)
    // This prevents issues when tokens have very short lifespans
    const marginInSeconds = Math.min(
      Math.max(Math.floor(this.accessTokenExpireTime * 0.2), 5),
      60
    );
    const minimumIntervalSeconds = 10;

    const accessTokenInterval = this.accessTokenExpireTime - marginInSeconds;

    let refreshInterval: number;

    if (
      this.refreshTokenExpireTime == undefined ||
      this.refreshTokenExpireTime === 0
    ) {
      // refresh_expires_in is 0 or not provided
      // Using offline_access or SSO session settings
      refreshInterval = accessTokenInterval;
    } else {
      const refreshTokenInterval =
        this.refreshTokenExpireTime - marginInSeconds;

      // Use the shorter interval to ensure we always refresh before expiration
      refreshInterval = Math.min(accessTokenInterval, refreshTokenInterval);
    }

    if (refreshInterval > 0) {
      refreshInterval = Math.max(refreshInterval, minimumIntervalSeconds);

      this.refreshIntervalId = setInterval(() => {
        this.refreshAccessToken();
      }, refreshInterval * 1000);
    } else {
      // Token too short to schedule safely - attempt immediate refresh
      // This will likely trigger re-authentication
      setTimeout(() => {
        if (!this.isRefreshing) {
          this.refreshAccessToken();
        }
      }, 1000);
    }
  };

  protected notify = (): void => {
    this.observers.forEach((observer) => {
      observer.update(this, [this.accessToken ? this.accessToken : '']);
    });
  };
}
