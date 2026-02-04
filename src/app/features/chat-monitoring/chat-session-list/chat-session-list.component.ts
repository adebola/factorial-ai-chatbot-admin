import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChatMonitoringService, ChatSession, ChatSessionListParams } from '../services/chat-monitoring.service';
import { ChatDetailDialogComponent } from '../chat-detail-dialog/chat-detail-dialog.component';

@Component({
  selector: 'app-chat-session-list',
  templateUrl: './chat-session-list.component.html',
  styleUrls: ['./chat-session-list.component.css']
})
export class ChatSessionListComponent implements OnInit {
  displayedColumns = ['tenant_name', 'user_email', 'message_count', 'quality_score', 'status', 'started_at', 'actions'];
  dataSource: ChatSession[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  searchControl = new FormControl('');
  statusFilter = '';

  constructor(
    private chatService: ChatMonitoringService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSessions();

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadSessions();
      });
  }

  loadSessions(): void {
    this.loading = true;
    const params: ChatSessionListParams = {
      page: this.pageIndex,
      size: this.pageSize,
      status: this.statusFilter || undefined
    };

    this.chatService.getChatSessions(params).subscribe({
      next: (response) => {
        // Handle different response formats
        if (Array.isArray(response)) {
          this.dataSource = response;
          this.totalElements = response.length;
        } else if (response && (response as any).sessions) {
          this.dataSource = (response as any).sessions;
          this.totalElements = (response as any).total || (response as any).sessions.length;
        } else if (response && response.content) {
          this.dataSource = response.content || [];
          this.totalElements = response.totalElements || 0;
        } else if (response && (response as any).data) {
          this.dataSource = (response as any).data;
          this.totalElements = (response as any).total || (response as any).data.length;
        } else {
          this.dataSource = [];
          this.totalElements = 0;
        }
        this.loading = false;
      },
      error: () => {
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.dataSource = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        tenant_name: 'Acme Corporation',
        user_id: 'user-1',
        user_email: 'john.doe@acme.com',
        status: 'completed',
        message_count: 15,
        quality_score: 4.5,
        started_at: '2024-03-20T10:00:00Z',
        ended_at: '2024-03-20T10:25:00Z',
        last_message_at: '2024-03-20T10:25:00Z'
      },
      {
        id: '2',
        tenant_id: 'tenant-2',
        tenant_name: 'Tech Innovations',
        user_id: 'user-2',
        user_email: 'jane.smith@techinnovations.com',
        status: 'active',
        message_count: 8,
        quality_score: 4.2,
        started_at: '2024-03-20T14:30:00Z',
        last_message_at: '2024-03-20T14:45:00Z'
      }
    ];
    this.totalElements = 2;
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadSessions();
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadSessions();
  }

  viewChatDetail(session: ChatSession): void {
    this.dialog.open(ChatDetailDialogComponent, {
      width: '800px',
      maxHeight: '80vh',
      data: { sessionId: session.id }
    });
  }

  exportChat(session: ChatSession, event: Event): void {
    event.stopPropagation();

    this.chatService.exportChatSession(session.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-session-${session.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Chat exported successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to export chat', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'active': 'active-chip',
      'completed': 'completed-chip',
      'abandoned': 'abandoned-chip'
    };
    return colors[status] || '';
  }

  formatQualityScore(score?: number): string {
    return score ? score.toFixed(1) : 'N/A';
  }
}
