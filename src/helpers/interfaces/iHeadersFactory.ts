export interface IHeadersFactory {
  authorizationHeader(accessToken: string);
  authAndUrlEncodedHeader(accessToken: string);
}
