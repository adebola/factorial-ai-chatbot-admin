import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface Subscription {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  plan_id: string;
  plan_name?: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  billing_cycle: string;
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  trial_starts_at?: string;
  trial_ends_at?: string;
  cancelled_at?: string | null;
  cancel_at_period_end?: boolean;
  cancellation_reason?: string | null;
  auto_renew: boolean;
  user_email: string;
  user_full_name: string;
  created_at: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_type: string;
  paystack_reference: string;
  description: string;
  created_at: string;
  processed_at?: string;
  payment_date?: string; // Legacy field for backward compatibility
  created_by?: string; // Legacy field for backward compatibility
}

export interface SubscriptionListParams {
  page?: number;
  size?: number;
  tenantId?: string;
  status?: string;
  planId?: string;
}

export interface PaymentListParams {
  page?: number;
  size?: number;
  tenantId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreatePaymentRequest {
  tenant_id: string;
  subscription_id: string;
  amount: number;
  payment_method: string;
  payment_date: string; // ISO string format
  reference_number?: string;
  notes: string;
  should_extend_subscription: boolean;
  extension_days: number;
}

export interface SubscriptionOverride {
  auto_renew?: boolean;
  current_period_end?: string;
  status?: string;
}

export interface SubscriptionOverrideRequest {
  usage_limit_overrides?: Record<string, number>;
  new_plan_id?: string;
  custom_expiration?: string;
  trial_extension_days?: number;
  reason: string;
}

export interface CustomLimitsResponse {
  subscription_id: string;
  tenant_id: string;
  plan_name: string | null;
  plan_limits: Record<string, number> | null;
  custom_limits: Record<string, number> | null;
  effective_limits: Record<string, number> | null;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get paginated list of subscriptions
   */
  getSubscriptions(params: SubscriptionListParams = {}): Observable<ApiResponse<Subscription[]>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 20).toString());

    if (params.tenantId) {
      httpParams = httpParams.set('tenantId', params.tenantId);
    }

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params.planId) {
      httpParams = httpParams.set('planId', params.planId);
    }

    return this.http.get<ApiResponse<Subscription[]>>(
      `${this.apiUrl}/admin/billing/subscriptions`,
      { params: httpParams }
    );
  }

  /**
   * Get subscription by ID
   */
  getSubscriptionById(subscriptionId: string): Observable<Subscription> {
    return this.http.get<Subscription>(
      `${this.apiUrl}/admin/billing/subscriptions/${subscriptionId}`
    );
  }

  /**
   * Get subscription by tenant ID
   */
  getSubscriptionByTenantId(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/billing/subscriptions/tenant/${tenantId}`);
  }

  /**
   * Update subscription (override)
   */
  updateSubscription(
    subscriptionId: string,
    override: SubscriptionOverride
  ): Observable<Subscription> {
    return this.http.put<Subscription>(
      `${this.apiUrl}/admin/billing/subscriptions/${subscriptionId}`,
      override
    );
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/admin/billing/subscriptions/${subscriptionId}/cancel`,
      {}
    );
  }

  /**
   * Get paginated list of payments
   */
  getPayments(params: PaymentListParams = {}): Observable<ApiResponse<Payment[]>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 20).toString());

    if (params.tenantId) {
      httpParams = httpParams.set('tenantId', params.tenantId);
    }

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }

    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }

    return this.http.get<ApiResponse<Payment[]>>(
      `${this.apiUrl}/admin/billing/payments`,
      { params: httpParams }
    );
  }

  /**
   * Create manual payment
   */
  createPayment(payment: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.apiUrl}/admin/billing/payments/manual`,
      payment
    );
  }

  /**
   * Get payment by ID
   */
  getPaymentById(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(
      `${this.apiUrl}/admin/billing/payments/${paymentId}`
    );
  }

  /**
   * Refund payment
   */
  refundPayment(paymentId: string, reason: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/admin/billing/payments/${paymentId}/refund`,
      { reason }
    );
  }

  overrideSubscription(subscriptionId: string, override: SubscriptionOverrideRequest): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/admin/billing/subscriptions/${subscriptionId}/override`,
      override
    );
  }

  getCustomLimits(subscriptionId: string): Observable<CustomLimitsResponse> {
    return this.http.get<CustomLimitsResponse>(
      `${this.apiUrl}/admin/billing/subscriptions/${subscriptionId}/custom-limits`
    );
  }

  clearCustomLimits(subscriptionId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/admin/billing/subscriptions/${subscriptionId}/custom-limits`
    );
  }
}
