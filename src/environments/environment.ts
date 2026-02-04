/**
 * Development Environment Configuration
 * ChatCraft Super Admin Application
 *
 * This configuration is used for local development.
 * OAuth2 client: superadmin-client
 * Required authority: ROLE_SYSTEM_ADMIN
 */

import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,

  // API Endpoints
  apiUrl: 'http://localhost:8080/api/v1',  // API Gateway base URL
  gatewayUrl: 'http://localhost:8080',     // API Gateway root
  authServiceUrl: 'http://localhost:9002/auth',  // Authorization Server

  // Service-specific URLs (for direct calls if needed)
  chatServiceUrl: 'http://localhost:8000',
  onboardingServiceUrl: 'http://localhost:8001',
  billingServiceUrl: 'http://localhost:8005',
  qualityServiceUrl: 'http://localhost:8003',

  // OAuth2 Configuration for Super Admin
  oauth2: {
    // Client credentials for superadmin-client
    clientId: 'superadmin-client',
    clientSecret: 'superadmin-secret',  // Used for backend token exchange (not exposed to browser)

    // Redirect URIs
    redirectUri: 'http://localhost:4201/callback',
    postLogoutRedirectUri: 'http://localhost:4201',

    // OAuth2 Endpoints
    authorizationUrl: 'http://localhost:9002/auth/oauth2/authorize',
    tokenUrl: 'http://localhost:9002/auth/oauth2/token',
    revocationUrl: 'http://localhost:9002/auth/oauth2/revoke',
    userInfoUrl: 'http://localhost:9002/auth/userinfo',

    // Scopes
    scope: 'openid profile read write admin system-admin',

    // PKCE (Proof Key for Code Exchange) - Disabled (using client_secret instead)
    usePkce: false,

    // Token storage
    tokenStorageKey: 'superadmin_access_token',
    refreshTokenStorageKey: 'superadmin_refresh_token',
    userStorageKey: 'superadmin_user',

    // Session configuration
    sessionTimeout: 3600000,  // 1 hour in milliseconds
    refreshTokenBeforeExpiry: 300000,  // Refresh 5 minutes before expiry
  },

  // Feature flags
  features: {
    enableAnalytics: true,
    enableQualityMonitoring: true,
    enableChatMonitoring: true,
    enableAuditLogs: true,
  },

  // UI Configuration
  ui: {
    itemsPerPage: 20,
    maxItemsPerPage: 100,
    defaultDateRange: 7,  // Default days for analytics
    chartRefreshInterval: 60000,  // 1 minute
  },

  // Logging
  enableDebugLogs: true,
};
