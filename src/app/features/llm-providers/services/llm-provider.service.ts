import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LLMProvider {
  id: string;
  provider: string;
  model_id: string;
  display_name: string;
  base_url: string | null;
  requires_api_key: boolean;
  has_system_api_key: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateLLMProviderRequest {
  provider: string;
  model_id: string;
  display_name: string;
  base_url?: string;
  api_key?: string;
  requires_api_key: boolean;
}

export interface UpdateLLMProviderRequest {
  display_name?: string;
  base_url?: string;
  api_key?: string;
  requires_api_key?: boolean;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LLMProviderService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProviders(activeOnly: boolean = false): Observable<LLMProvider[]> {
    const params: { [key: string]: string } = {};
    if (!activeOnly) {
      params['active_only'] = 'false';
    }
    return this.http.get<LLMProvider[]>(
      `${this.baseUrl}/admin/llm-providers`, { params }
    );
  }

  getProvider(id: string): Observable<LLMProvider> {
    return this.http.get<LLMProvider>(
      `${this.baseUrl}/admin/llm-providers/${id}`
    );
  }

  createProvider(data: CreateLLMProviderRequest): Observable<LLMProvider> {
    return this.http.post<LLMProvider>(
      `${this.baseUrl}/admin/llm-providers`, data
    );
  }

  updateProvider(id: string, data: UpdateLLMProviderRequest): Observable<LLMProvider> {
    return this.http.put<LLMProvider>(
      `${this.baseUrl}/admin/llm-providers/${id}`, data
    );
  }

  deleteProvider(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/llm-providers/${id}`
    );
  }
}
