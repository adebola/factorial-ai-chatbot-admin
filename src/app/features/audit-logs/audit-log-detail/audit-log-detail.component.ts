import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuditLogService, AuditEvent } from '../services/audit-log.service';

@Component({
  selector: 'app-audit-log-detail',
  templateUrl: './audit-log-detail.component.html',
  styleUrls: ['./audit-log-detail.component.css']
})
export class AuditLogDetailComponent implements OnInit {
  event: AuditEvent | null = null;
  loading = true;
  eventId: string;

  constructor(
    private auditLogService: AuditLogService,
    private dialogRef: MatDialogRef<AuditLogDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { eventId: string }
  ) {
    this.eventId = data.eventId;
  }

  ngOnInit(): void {
    this.loadEvent();
  }

  loadEvent(): void {
    this.loading = true;
    this.auditLogService.getEvent(this.eventId).subscribe({
      next: (event: AuditEvent) => {
        this.event = event;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  formatJson(obj: any): string {
    if (!obj) return 'N/A';
    return JSON.stringify(obj, null, 2);
  }

  getTierClass(tier: string): string {
    return tier === 'security' ? 'tier-security' : 'tier-data';
  }

  copyTraceId(): void {
    if (this.event?.trace_id) {
      navigator.clipboard.writeText(this.event.trace_id);
    }
  }
}
