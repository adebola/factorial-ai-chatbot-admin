import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { environment } from '../../../../environments/environment';
import { AgentSessionDetailComponent } from './agent-session-detail.component';

export interface AgentSessionSummary {
  id: string;
  tenant_id: string;
  user_id: string;
  user_email: string | null;
  user_full_name: string | null;
  service_key: string;
  status: string;
  total_tokens_used: number;
  context_limit_tokens: number | null;
  model_name: string | null;
  message_count: number;
  parent_session_id: string | null;
  created_at: string;
  last_activity: string;
}

@Component({
  selector: 'app-agent-sessions',
  templateUrl: './agent-sessions.component.html',
  styleUrls: ['./agent-sessions.component.css']
})
export class AgentSessionsComponent implements OnInit {
  displayedColumns = ['service_key', 'user_email', 'status', 'message_count', 'tokens_used', 'model_name', 'last_activity', 'actions'];
  dataSource: AgentSessionSummary[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  // Filters
  filterServiceKey = '';
  filterStatus = '';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.pageIndex.toString())
      .set('size', this.pageSize.toString());
    if (this.filterServiceKey) {
      params = params.set('service_key', this.filterServiceKey);
    }
    if (this.filterStatus) {
      params = params.set('status', this.filterStatus);
    }

    this.http.get<any>(`${environment.apiUrl}/admin/agent-sessions`, { params }).subscribe({
      next: (response) => {
        // Handle both paginated and array responses
        if (Array.isArray(response)) {
          this.dataSource = response;
          this.totalElements = response.length;
        } else {
          this.dataSource = response.items || response.content || response.sessions || [];
          this.totalElements = response.total || response.totalElements || this.dataSource.length;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading agent sessions:', err);
        this.snackBar.open('Failed to load agent sessions', 'Close', { duration: 3000 });
        this.dataSource = [];
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSessions();
  }

  applyFilter(): void {
    this.pageIndex = 0;
    this.loadSessions();
  }

  viewDetail(session: AgentSessionSummary): void {
    this.dialog.open(AgentSessionDetailComponent, {
      width: '900px',
      maxHeight: '80vh',
      data: { session }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'accent';
      case 'context_overflow': return 'warn';
      default: return '';
    }
  }
}
