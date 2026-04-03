import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ModelRegistryConfig {
  id: string;
  provider: string;
  model_name: string;
  display_name: string | null;
  max_context_tokens: number;
  context_limit_tokens: number;
  max_response_tokens: number;
  cost_per_input_token: number;
  cost_per_output_token: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateModelRegistryRequest {
  provider: string;
  model_name: string;
  display_name?: string;
  max_context_tokens: number;
  context_limit_tokens: number;
  max_response_tokens?: number;
  cost_per_input_token?: number;
  cost_per_output_token?: number;
}

export interface UpdateModelRegistryRequest {
  display_name?: string;
  max_context_tokens?: number;
  context_limit_tokens?: number;
  max_response_tokens?: number;
  cost_per_input_token?: number;
  cost_per_output_token?: number;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModelRegistryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConfigs(includeInactive: boolean = false): Observable<ModelRegistryConfig[]> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('include_inactive', 'true');
    }
    return this.http.get<ModelRegistryConfig[]>(
      `${this.baseUrl}/admin/model-registry`, { params }
    );
  }

  getConfig(id: string): Observable<ModelRegistryConfig> {
    return this.http.get<ModelRegistryConfig>(
      `${this.baseUrl}/admin/model-registry/${id}`
    );
  }

  createConfig(data: CreateModelRegistryRequest): Observable<ModelRegistryConfig> {
    return this.http.post<ModelRegistryConfig>(
      `${this.baseUrl}/admin/model-registry`, data
    );
  }

  updateConfig(id: string, data: UpdateModelRegistryRequest): Observable<ModelRegistryConfig> {
    return this.http.put<ModelRegistryConfig>(
      `${this.baseUrl}/admin/model-registry/${id}`, data
    );
  }

  deleteConfig(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/model-registry/${id}`
    );
  }
}
