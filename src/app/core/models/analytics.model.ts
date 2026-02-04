/**
 * Analytics Models
 * Models for platform-wide analytics and metrics
 */

/**
 * Platform Metrics
 */
export interface PlatformMetrics {
  tenants: {
    total: number;
    active: number;
    inactive: number;
    newLast30Days: number;
  };
  users: {
    total: number;
    active: number;
    verified: number;
    newLast30Days: number;
  };
  billing: {
    mrr: number;
    arr: number;
    totalRevenue: number;
    activeSubscriptions: number;
  };
  timestamp: string;
}

/**
 * Growth Metrics
 */
export interface GrowthMetrics {
  days: number;
  data: GrowthDataPoint[];
  summary: {
    totalTenants: number;
    newInPeriod: number;
  };
}

export interface GrowthDataPoint {
  date: string;
  newTenants: number;
  totalTenants: number;
}

/**
 * Revenue Analytics
 */
export interface RevenueAnalytics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  revenueByMonth: RevenueDataPoint[];
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  subscriptions: number;
}

/**
 * System Health
 */
export interface SystemHealth {
  authorizationServer: string;
  billingService: string;
  chatService?: string;
  onboardingService?: string;
  timestamp: string;
}
