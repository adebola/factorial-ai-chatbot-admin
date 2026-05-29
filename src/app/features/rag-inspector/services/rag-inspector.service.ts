import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RagInspectRequest {
  tenant_id: string;
  query: string;
  k: number;
  max_distance: number;
}

export interface RagInspectChunk {
  chunk_id: string;
  rank: number;
  distance: number;
  source_type: string | null;
  source_name: string | null;
  section_title: string | null;
  chunk_index: number | null;
  content_preview: string;
}

export interface RagInspectResponse {
  tenant_id: string;
  query: string;
  query_embedding_dim: number;
  total_chunks_in_store: number;
  returned: RagInspectChunk[];
  dropped_by_threshold: number;
}

@Injectable({
  providedIn: 'root'
})
export class RagInspectorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  inspect(req: RagInspectRequest): Observable<RagInspectResponse> {
    return this.http.post<RagInspectResponse>(
      `${this.apiUrl}/admin/rag/inspect`,
      req
    );
  }
}
