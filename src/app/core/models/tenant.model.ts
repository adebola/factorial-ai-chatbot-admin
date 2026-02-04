/**
 * Tenant Model
 * Represents a tenant/organization in the ChatCraft system
 */

export interface Tenant {
  id: string;
  name: string;
  domain: string | null;
  apiKey: string;
  config: any;
  planId: string;
  subscriptionId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  userCount?: number;
}

/**
 * Tenant Summary (for list views)
 */
export interface TenantSummary {
  id: string;
  name: string;
  domain: string | null;
  planId: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Tenant Detail (with additional info)
 */
export interface TenantDetail extends Tenant {
  users: UserSummary[];
  subscription?: Subscription;
}

/**
 * Update Tenant Request
 */
export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  config?: any;
  planId?: string;
}

/**
 * User Summary (nested in tenant)
 */
export interface UserSummary {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

/**
 * Subscription (nested in tenant)
 */
export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}
