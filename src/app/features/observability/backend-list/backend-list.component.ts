import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ObservabilityService,
  ObservabilityBackend
} from '../services/observability.service';
import { BackendFormDialogComponent } from '../backend-form-dialog/backend-form-dialog.component';
import { TenantService } from '../../tenants/services/tenant.service';

interface TenantOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-backend-list',
  templateUrl: './backend-list.component.html',
  styleUrls: ['./backend-list.component.css']
})
export class BackendListComponent implements OnInit {
  displayedColumns = ['backend_type', 'url', 'auth_type', 'tenant', 'status', 'created_at', 'actions'];
  dataSource: ObservabilityBackend[] = [];
  loading = false;
  error: string | null = null;

  tenants: TenantOption[] = [];
  loadingTenants = false;
  selectedTenantId: string = '';
  tenantNameMap: Record<string, string> = {};

  constructor(
    private observabilityService: ObservabilityService,
    private tenantService: TenantService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTenants();
    this.loadBackends();
  }

  loadTenants(): void {
    this.loadingTenants = true;
    this.tenantService.getTenantDropdown().subscribe({
      next: (data) => {
        this.tenants = Array.isArray(data) ? data : [];
        this.tenants.forEach(t => this.tenantNameMap[t.id] = t.name);
        this.loadingTenants = false;
      },
      error: () => {
        this.loadingTenants = false;
      }
    });
  }

  loadBackends(): void {
    this.loading = true;
    this.error = null;

    const tenantId = this.selectedTenantId || undefined;

    this.observabilityService.getBackends(tenantId).subscribe({
      next: (backends) => {
        this.dataSource = Array.isArray(backends) ? backends : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading backends:', err);
        this.error = 'Failed to load observability backends.';
        this.dataSource = [];
        this.loading = false;
      }
    });
  }

  onTenantFilterChange(): void {
    this.loadBackends();
  }

  getTenantName(tenantId: string): string {
    return this.tenantNameMap[tenantId] || tenantId.substring(0, 8) + '...';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(BackendFormDialogComponent, {
      width: '600px',
      data: { mode: 'create', tenants: this.tenants }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBackends();
      }
    });
  }

  openEditDialog(backend: ObservabilityBackend, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(BackendFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', backend, tenants: this.tenants }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBackends();
      }
    });
  }

  testBackend(backend: ObservabilityBackend, event: Event): void {
    event.stopPropagation();

    this.snackBar.open('Testing connectivity...', '', { duration: 2000 });

    this.observabilityService.testBackend(backend.tenant_id, backend.backend_type).subscribe({
      next: (result) => {
        let msg: string;
        if (result.reachable) {
          msg = result.response_time_ms != null
            ? `Reachable (${result.response_time_ms}ms)`
            : 'Reachable';
        } else {
          msg = `Unreachable: ${result.error || 'Unknown error'}`;
        }
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      },
      error: (err) => {
        console.error('Test connectivity error:', err);
        this.snackBar.open('Connectivity test failed', 'Close', { duration: 3000 });
      }
    });
  }

  deleteBackend(backend: ObservabilityBackend, event: Event): void {
    event.stopPropagation();

    const tenantName = this.getTenantName(backend.tenant_id);
    if (confirm(`Delete ${backend.backend_type} backend for "${tenantName}"?`)) {
      this.observabilityService.deleteBackend(backend.tenant_id, backend.backend_type).subscribe({
        next: () => {
          this.snackBar.open('Backend deleted successfully', 'Close', { duration: 3000 });
          this.loadBackends();
        },
        error: (err) => {
          console.error('Error deleting backend:', err);
          this.snackBar.open('Failed to delete backend', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getBackendTypeIcon(type: string): string {
    switch (type) {
      case 'prometheus': return 'show_chart';
      case 'elasticsearch': return 'search';
      case 'jaeger': return 'timeline';
      case 'alertmanager': return 'notifications_active';
      case 'otel_collector': return 'hub';
      case 'k8s': return 'cloud';
      case 'llm': return 'psychology';
      default: return 'settings';
    }
  }

  getBackendTypeColor(type: string): string {
    switch (type) {
      case 'prometheus': return 'primary';
      case 'elasticsearch': return 'accent';
      case 'alertmanager': return 'warn';
      default: return '';
    }
  }
}
