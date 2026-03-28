/**
 * Application-wide Constants
 * ChatCraft Super Admin
 */

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/oauth2/authorize',
    TOKEN: '/oauth2/token',
    LOGOUT: '/oauth2/revoke',
    USER_INFO: '/userinfo',
  },

  // Tenant Management
  TENANTS: {
    LIST: '/admin/tenants',
    DETAIL: (id: string) => `/admin/tenants/${id}`,
    UPDATE: (id: string) => `/admin/tenants/${id}`,
    SUSPEND: (id: string) => `/admin/tenants/${id}/suspend`,
    ACTIVATE: (id: string) => `/admin/tenants/${id}/activate`,
    SUBSCRIPTION: (id: string) => `/admin/tenants/${id}/subscription`,
  },

  // User Management
  USERS: {
    LIST: '/admin/users',
    DETAIL: (id: string) => `/admin/users/${id}`,
    ASSIGN_SYSTEM_ADMIN: (id: string) => `/admin/users/${id}/roles/system-admin`,
    REMOVE_SYSTEM_ADMIN: (id: string) => `/admin/users/${id}/roles/system-admin`,
    SUSPEND: (id: string) => `/admin/users/${id}/suspend`,
    ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
    RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password`,
  },

  // Analytics
  ANALYTICS: {
    PLATFORM_METRICS: '/admin/analytics/platform-metrics',
    TENANT_GROWTH: '/admin/analytics/tenant-growth',
    USER_GROWTH: '/admin/analytics/user-growth',
    REVENUE: '/admin/analytics/revenue',
    HEALTH: '/admin/analytics/health',
  },

  // Chat Monitoring
  CHAT: {
    SESSIONS: '/admin/sessions',
    SESSION_DETAIL: (id: string) => `/admin/sessions/${id}`,
    SESSION_MESSAGES: (id: string) => `/admin/sessions/${id}/messages`,
    SEARCH_MESSAGES: '/admin/messages/search',
    STATS: '/admin/stats',
  },

  // Quality Monitoring
  QUALITY: {
    ALL_TENANTS: '/admin/quality/all-tenants',
    TENANT_DETAIL: (id: string) => `/admin/quality/tenant/${id}`,
    DASHBOARD: '/dashboard/overview',
    TRENDS: '/dashboard/trends',
    GAPS: '/gaps',
  },

  // Billing
  BILLING: {
    SUBSCRIPTIONS: '/admin/subscriptions',
    SUBSCRIPTION_DETAIL: (id: string) => `/admin/subscriptions/${id}`,
    PAYMENTS: '/admin/payments',
    MANUAL_PAYMENT: '/admin/payments/manual',
    ANALYTICS: '/admin/analytics',
  },

  // Plans
  PLANS: {
    LIST: '/plans',
    CREATE: '/plans',
    UPDATE: (id: string) => `/plans/${id}`,
    DELETE: (id: string) => `/plans/${id}`,
    DETAIL: (id: string) => `/plans/${id}`,
  },

  // Observability
  OBSERVABILITY: {
    LIST: '/admin/observability',
    CREATE: '/admin/observability',
    UPDATE: (tenantId: string, backendType: string) => `/admin/observability/${tenantId}/${backendType}`,
    DELETE: (tenantId: string, backendType: string) => `/admin/observability/${tenantId}/${backendType}`,
    TEST: (tenantId: string, backendType: string) => `/admin/observability/${tenantId}/${backendType}/test`,
  },

  // Agentic Services
  SERVICES: {
    LIST: '/admin/services',
    CREATE: '/admin/services',
    DETAIL: (id: string) => `/admin/services/${id}`,
    UPDATE: (id: string) => `/admin/services/${id}`,
    DELETE: (id: string) => `/admin/services/${id}`,
    HEALTH: (id: string) => `/admin/services/${id}/health`,
    ASSIGN: (serviceId: string) => `/admin/services/${serviceId}/assign`,
    REVOKE: (serviceId: string, tenantId: string) => `/admin/services/${serviceId}/assign/${tenantId}`,
    TENANTS: (serviceId: string) => `/admin/services/${serviceId}/tenants`,
    TENANT_SERVICES: (tenantId: string) => `/admin/tenants/${tenantId}/services`,
  },
};

/**
 * Application Routes
 */
export const APP_ROUTES = {
  LOGIN: '/login',
  CALLBACK: '/callback',
  DASHBOARD: '/dashboard',
  TENANTS: '/tenants',
  TENANT_DETAIL: (id: string) => `/tenants/${id}`,
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  BILLING: {
    SUBSCRIPTIONS: '/billing/subscriptions',
    PAYMENTS: '/billing/payments',
    MANUAL_PAYMENT: '/billing/manual-payment',
  },
  PLANS: '/plans',
  CHAT_MONITORING: '/chat-monitoring/sessions',
  QUALITY: {
    OVERVIEW: '/quality/overview',
    TENANT: (id: string) => `/quality/tenant/${id}`,
  },
  ANALYTICS: '/analytics/platform',
  SERVICES: '/services',
  SERVICE_DETAIL: (id: string) => `/services/${id}`,
  OBSERVABILITY: '/observability',
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'superadmin_access_token',
  REFRESH_TOKEN: 'superadmin_refresh_token',
  USER: 'superadmin_user',
  CODE_VERIFIER: 'pkce_code_verifier',
};

/**
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
};

/**
 * User Roles
 */
export const USER_ROLES = {
  SYSTEM_ADMIN: 'ROLE_SYSTEM_ADMIN',
  TENANT_ADMIN: 'ROLE_TENANT_ADMIN',
};

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, y, h:mm a',
  DISPLAY_SHORT: 'MMM d, y',
  ISO: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
};

/**
 * Chart Colors (matching ChatCraft brand)
 */
export const CHART_COLORS = {
  PRIMARY: '#5D3EC1',      // Purple
  SECONDARY: '#C15D3E',    // Orange/Red
  SUCCESS: '#3EC15D',      // Green
  WARNING: '#F4C430',      // Yellow
  DANGER: '#E74C3C',       // Red
  INFO: '#3498DB',         // Blue
  GRAY: '#95A5A6',         // Gray
};

/**
 * Chart Configuration
 */
export const CHART_CONFIG = {
  REFRESH_INTERVAL: 60000,  // 1 minute
  ANIMATION_DURATION: 750,
  DEFAULT_HEIGHT: 300,
};

/**
 * Notification Duration (milliseconds)
 */
export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
};

/**
 * Debounce Times (milliseconds)
 */
export const DEBOUNCE_TIME = {
  SEARCH: 500,
  FILTER: 300,
  RESIZE: 200,
};
