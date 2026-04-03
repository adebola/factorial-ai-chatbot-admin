import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { AgentSessionSummary } from './agent-sessions.component';

interface AgentMessageDetail {
  id: string;
  role: string;
  content: string;
  structured_blocks: any[] | null;
  token_count: number;
  tool_calls: any[] | null;
  created_at: string;
}

@Component({
  selector: 'app-agent-session-detail',
  template: `
    <h2 mat-dialog-title>Session Detail</h2>
    <mat-dialog-content>
      <!-- Session Info -->
      <div class="session-info">
        <div class="info-row">
          <span class="label">Service:</span>
          <mat-chip>{{ session.service_key }}</mat-chip>
        </div>
        <div class="info-row">
          <span class="label">User:</span>
          <span>{{ session.user_full_name || session.user_id }}</span>
          <span class="muted" *ngIf="session.user_email">({{ session.user_email }})</span>
        </div>
        <div class="info-row">
          <span class="label">Status:</span>
          <mat-chip [color]="session.status === 'active' ? 'primary' : 'warn'" selected>
            {{ session.status }}
          </mat-chip>
        </div>
        <div class="info-row">
          <span class="label">Tokens:</span>
          <span>{{ session.total_tokens_used | number }}
            <span *ngIf="session.context_limit_tokens"> / {{ session.context_limit_tokens | number }}</span>
          </span>
        </div>
        <div class="info-row" *ngIf="session.parent_session_id">
          <span class="label">Parent Session:</span>
          <code>{{ session.parent_session_id }}</code>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Messages -->
      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="30"></mat-spinner>
      </div>

      <div class="messages" *ngIf="!loading">
        <div *ngFor="let msg of messages" class="message" [ngClass]="'message-' + msg.role">
          <div class="message-header">
            <strong>{{ msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Agent' : msg.role }}</strong>
            <span class="muted">{{ msg.created_at | date:'HH:mm:ss' }}</span>
            <span class="token-badge">{{ msg.token_count }} tokens</span>
          </div>
          <div class="message-content">{{ msg.content }}</div>
          <div *ngIf="msg.tool_calls && msg.tool_calls.length > 0" class="tool-calls">
            <mat-chip-listbox *ngFor="let tc of msg.tool_calls">
              <mat-chip>{{ tc.tool }}</mat-chip>
            </mat-chip-listbox>
          </div>
        </div>
        <div *ngIf="messages.length === 0" class="empty">No messages in this session.</div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .session-info { margin-bottom: 16px; }
    .info-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .label { font-weight: 600; min-width: 100px; color: #666; }
    .muted { color: #999; font-size: 13px; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    mat-divider { margin: 16px 0; }
    .loading { display: flex; justify-content: center; padding: 20px; }
    .messages { max-height: 400px; overflow-y: auto; }
    .message { padding: 10px; margin-bottom: 8px; border-radius: 8px; }
    .message-user { background: #e8eaf6; }
    .message-assistant { background: #f5f5f5; }
    .message-system { background: #fff3e0; }
    .message-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .token-badge { font-size: 11px; background: #e0e0e0; padding: 1px 6px; border-radius: 8px; }
    .message-content { font-size: 13px; white-space: pre-wrap; word-break: break-word; max-height: 200px; overflow-y: auto; }
    .tool-calls { margin-top: 6px; }
    .empty { text-align: center; padding: 20px; color: #999; }
  `]
})
export class AgentSessionDetailComponent implements OnInit {
  session: AgentSessionSummary;
  messages: AgentMessageDetail[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AgentSessionDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.session = data.session;
  }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/agent-sessions/${this.session.id}`).subscribe({
      next: (response) => {
        this.messages = response.messages || response || [];
        this.loading = false;
      },
      error: () => {
        this.messages = [];
        this.loading = false;
      }
    });
  }
}
