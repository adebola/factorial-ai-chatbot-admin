export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  gatewayUrl: 'http://localhost:8080',
  authServiceUrl: 'http://localhost:9002/auth',

  // OAuth2 Configuration
  oauth2: {
    clientId: 'adminclient',
    clientSecret: 'adminclient-secret',
    redirectUri: 'http://localhost:4201/callback',
    scope: 'openid profile read write admin',
    authorizationUrl: 'http://localhost:9002/auth/oauth2/authorize',
    tokenUrl: 'http://localhost:9002/auth/oauth2/token',
    revocationUrl: 'http://localhost:9002/auth/oauth2/revoke'
  }
};