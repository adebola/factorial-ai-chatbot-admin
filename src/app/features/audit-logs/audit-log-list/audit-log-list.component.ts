import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuditLogService, AuditEvent, AuditFilters, AuditStatsResponse } from '../services/audit-log.service';
import { AuditLogDetailComponent } from '../audit-log-detail/audit-log-detail.component';

@Component({
  selector: 'app-audit-log-list',
  templateUrl: './audit-log-list.component.html',
  styleUrls: ['./audit-log-list.component.css']
})
export class AuditLogListComponent implements OnInit {
  displayedColumns = ['occurred_at', 'action_type', 'tier', 'actor_email', 'source_service', 'resource_type', 'trace_id'];
  dataSource: AuditEvent[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  // Stats
  stats: AuditStatsResponse | null = null;
  statsLoading = false;

  // Filters
  tenantIdFilter = new FormControl('');
  actorUserIdFilter = new FormControl('');
  traceIdFilter = new FormControl('');
  tierFilter = '';
  sourceServiceFilter = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  tierOptions = ['security', 'data'];
  sourceServiceOptions = [
    'chat-service',
    'onboarding-service',
    'billing-service',
    'auth-service',
    'workflow-service',
    'observability-service'
  ];

  constructor(
    private auditLogService: AuditLogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadStats();

    // Debounced text filter inputs
    this.tenantIdFilter.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadEvents();
      });

    this.actorUserIdFilter.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadEvents();
      });

    this.traceIdFilter.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadEvents();
      });
  }

  loadEvents(): void {
    this.loading = true;
    const filters: AuditFilters = {
      page: this.pageIndex,
      size: this.pageSize,
      tenant_id: this.tenantIdFilter.value || undefined,
      actor_user_id: this.actorUserIdFilter.value || undefined,
      trace_id: this.traceIdFilter.value || undefined,
      tier: this.tierFilter || undefined,
      source_service: this.sourceServiceFilter || undefined,
      date_from: this.dateFrom ? this.dateFrom.toISOString() : undefined,
      date_to: this.dateTo ? this.dateTo.toISOString() : undefined
    };

    this.auditLogService.getEvents(filters).subscribe({
      next: (response) => {
        this.dataSource = response.items || [];
        this.totalElements = response.total || 0;
        this.loading = false;
      },
      error: () => {
        this.dataSource = [];
        this.totalElements = 0;
        this.loading = false;
        this.snackBar.open('Failed to load audit events', 'Close', { duration: 3000 });
      }
    });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.auditLogService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.statsLoading = false;
      },
      error: () => {
        this.stats = null;
        this.statsLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadEvents();
  }

  onDateChange(): void {
    this.pageIndex = 0;
    this.loadEvents();
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadEvents();
  }

  clearFilters(): void {
    this.tenantIdFilter.setValue('');
    this.actorUserIdFilter.setValue('');
    this.traceIdFilter.setValue('');
    this.tierFilter = '';
    this.sourceServiceFilter = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.pageIndex = 0;
    this.loadEvents();
  }

  viewEventDetail(event: AuditEvent): void {
    this.dialog.open(AuditLogDetailComponent, {
      width: '900px',
      maxHeight: '85vh',
      data: { eventId: event.event_id }
    });
  }

  exportEvents(format: 'csv' | 'json'): void {
    const filters: AuditFilters = {
      tenant_id: this.tenantIdFilter.value || undefined,
      date_from: this.dateFrom ? this.dateFrom.toISOString() : undefined,
      date_to: this.dateTo ? this.dateTo.toISOString() : undefined
    };

    this.auditLogService.exportEvents(filters, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-events-export.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snackBar.open(`Audit events exported as ${format.toUpperCase()}`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to export audit events', 'Close', { duration: 3000 });
      }
    });
  }

  getTierClass(tier: string): string {
    return tier === 'security' ? 'tier-security' : 'tier-data';
  }

  getStatKeys(obj: { [key: string]: number }): string[] {
    return Object.keys(obj || {});
  }
}
