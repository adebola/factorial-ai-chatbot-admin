import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface Plan {
  id: string;
  name: string;
  description: string;
  document_limit: number;
  website_limit: number;
  daily_chat_limit: number;
  monthly_chat_limit: number;
  monthly_plan_cost: string;
  yearly_plan_cost: string;
  features: string[] | null;
  is_active: boolean;
  is_deleted: boolean;
  tenant_count?: number;
  created_at: string;
  updated_at: string | null;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  document_limit: number;
  website_limit: number;
  daily_chat_limit: number;
  monthly_chat_limit: number;
  monthly_plan_cost: string;
  yearly_plan_cost: string;
  features?: string[];
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  is_active?: boolean;
}

export interface PlanStats {
  plan_id: string;
  plan_name: string;
  total_tenants: number;
  active_tenants: number;
  total_revenue: number;
  monthly_revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPlans(): Observable<ApiResponse<Plan[]>> {
    return this.http.get<ApiResponse<Plan[]>>(`${this.apiUrl}/plans`);
  }

  getPlanById(planId: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/plans/${planId}`);
  }

  createPlan(plan: CreatePlanRequest): Observable<Plan> {
    return this.http.post<Plan>(`${this.apiUrl}/plans`, plan);
  }

  updatePlan(planId: string, updates: UpdatePlanRequest): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/plans/${planId}`, updates);
  }

  deletePlan(planId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plans/${planId}`);
  }

  getPlanStats(planId: string): Observable<PlanStats> {
    return this.http.get<PlanStats>(`${this.apiUrl}/plans/${planId}/stats`);
  }

  activatePlan(planId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/plans/${planId}/activate`, {});
  }

  deactivatePlan(planId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/plans/${planId}/deactivate`, {});
  }
}
