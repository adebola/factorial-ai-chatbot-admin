/**
 * Environment Configuration Interface
 * Provides type safety for environment configurations
 */

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  revocationUrl: string;
  userInfoUrl: string;
  scope: string;
  usePkce: boolean;
  tokenStorageKey: string;
  refreshTokenStorageKey: string;
  userStorageKey: string;
  sessionTimeout: number;
  refreshTokenBeforeExpiry: number;
}

export interface FeatureFlags {
  enableAnalytics: boolean;
  enableQualityMonitoring: boolean;
  enableChatMonitoring: boolean;
  enableAuditLogs: boolean;
}

export interface UIConfig {
  itemsPerPage: number;
  maxItemsPerPage: number;
  defaultDateRange: number;
  chartRefreshInterval: number;
}

export interface Environment {
  production: boolean;
  apiUrl: string;
  gatewayUrl: string;
  authServiceUrl: string;
  chatServiceUrl: string;
  onboardingServiceUrl: string;
  billingServiceUrl: string;
  qualityServiceUrl: string;
  oauth2: OAuth2Config;
  features: FeatureFlags;
  ui: UIConfig;
  enableDebugLogs: boolean;
}
