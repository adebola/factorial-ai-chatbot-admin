/**
 * Production Environment Configuration
 * ChatCraft Super Admin Application
 *
 * This configuration is used for production deployment.
 * OAuth2 client: superadmin-client
 * Required authority: ROLE_SYSTEM_ADMIN
 */

import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,

  // API Endpoints (Production)
  apiUrl: 'https://api.chatcraft.cc/api/v1',  // API Gateway base URL
  gatewayUrl: 'https://api.chatcraft.cc',     // API Gateway root
  authServiceUrl: 'https://api.chatcraft.cc/auth',  // Authorization Server

  // Service-specific URLs (Production)
  chatServiceUrl: 'https://chat.chatcraft.cc',
  onboardingServiceUrl: 'https://onboarding.chatcraft.cc',
  billingServiceUrl: 'https://billing.chatcraft.cc',
  qualityServiceUrl: 'https://quality.chatcraft.cc',

  // OAuth2 Configuration for Super Admin
  oauth2: {
    // Client credentials for superadmin-client
    clientId: 'superadmin-client',
    clientSecret: 'superadmin-secret',  // Should not be stored in frontend for production

    // Redirect URIs (Production)
    redirectUri: 'https://admin.chatcraft.cc/callback',
    postLogoutRedirectUri: 'https://admin.chatcraft.cc',

    // OAuth2 Endpoints (Production)
    authorizationUrl: 'https://auth.chatcraft.cc/auth/oauth2/authorize',
    tokenUrl: 'https://auth.chatcraft.cc/auth/oauth2/token',
    revocationUrl: 'https://auth.chatcraft.cc/auth/oauth2/revoke',
    userInfoUrl: 'https://auth.chatcraft.cc/auth/userinfo',

    // Scopes
    scope: 'openid profile read write admin system-admin',

    // PKCE (Proof Key for Code Exchange) - Required
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
    chartRefreshInterval: 300000,  // 5 minutes in production
  },

  // Logging
  enableDebugLogs: false,  // Disable debug logs in production
};
