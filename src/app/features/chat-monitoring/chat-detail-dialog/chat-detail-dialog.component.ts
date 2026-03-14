import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChatMonitoringService, ChatMessage, ChatMessagesResponse } from '../services/chat-monitoring.service';

@Component({
  selector: 'app-chat-detail-dialog',
  templateUrl: './chat-detail-dialog.component.html',
  styleUrls: ['./chat-detail-dialog.component.css']
})
export class ChatDetailDialogComponent implements OnInit {
  messages: ChatMessage[] = [];
  tenantName: string = '';
  loading = true;
  sessionId: string;

  constructor(
    private chatService: ChatMonitoringService,
    private dialogRef: MatDialogRef<ChatDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.sessionId = data.sessionId;
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.chatService.getChatMessages(this.sessionId).subscribe({
      next: (response: ChatMessagesResponse) => {
        this.tenantName = response.tenant_name || '';
        this.messages = response.messages || [];
        this.loading = false;
      },
      error: () => {
        this.loadMockMessages();
        this.loading = false;
      }
    });
  }

  loadMockMessages(): void {
    this.messages = [
      {
        id: '1',
        session_id: this.sessionId,
        role: 'user',
        content: 'Hello, I need help with my account.',
        timestamp: '2024-03-20T10:00:00Z'
      },
      {
        id: '2',
        session_id: this.sessionId,
        role: 'assistant',
        content: 'Hello! I\'d be happy to help you with your account. What specific issue are you experiencing?',
        timestamp: '2024-03-20T10:00:05Z'
      },
      {
        id: '3',
        session_id: this.sessionId,
        role: 'user',
        content: 'I can\'t seem to reset my password.',
        timestamp: '2024-03-20T10:01:00Z'
      },
      {
        id: '4',
        session_id: this.sessionId,
        role: 'assistant',
        content: 'I understand. Let me guide you through the password reset process. First, please go to the login page and click on "Forgot Password".',
        timestamp: '2024-03-20T10:01:10Z'
      }
    ];
  }

  close(): void {
    this.dialogRef.close();
  }

  getRoleClass(role: string): string {
    return `message-${role}`;
  }
}
