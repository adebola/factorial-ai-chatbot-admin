import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AgenticServiceService,
  AgenticService,
  TenantAssignment
} from '../services/agentic-service.service';
import { AssignDialogComponent } from '../assign-dialog/assign-dialog.component';
import { ServiceFormDialogComponent } from '../service-form-dialog/service-form-dialog.component';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css']
})
export class ServiceDetailComponent implements OnInit {
  service: AgenticService | null = null;
  assignments: TenantAssignment[] = [];
  loading = true;
  assignmentsLoading = false;
  error: string | null = null;

  assignmentColumns = ['tenant_id', 'assigned_by_email', 'config', 'is_active', 'created_at', 'actions'];

  private serviceId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agenticService: AgenticServiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.serviceId) {
      this.router.navigate(['/services']);
      return;
    }
    this.loadService();
    this.loadAssignments();
  }

  loadService(): void {
    this.loading = true;
    this.agenticService.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        this.service = service;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading service:', err);
        this.error = 'Failed to load service details';
        this.loading = false;
      }
    });
  }

  loadAssignments(): void {
    this.assignmentsLoading = true;
    this.agenticService.getAssignedTenants(this.serviceId, true).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.assignmentsLoading = false;
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.assignmentsLoading = false;
      }
    });
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(ServiceFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', service: this.service }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadService();
      }
    });
  }

  openAssignDialog(): void {
    const dialogRef = this.dialog.open(AssignDialogComponent, {
      width: '500px',
      data: { serviceId: this.serviceId, serviceName: this.service?.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAssignments();
        this.loadService();
      }
    });
  }

  revokeAssignment(assignment: TenantAssignment, event: Event): void {
    event.stopPropagation();

    if (confirm(`Revoke service from tenant ${assignment.tenant_id}?`)) {
      this.agenticService.revokeService(this.serviceId, assignment.tenant_id).subscribe({
        next: () => {
          this.snackBar.open('Service revoked from tenant', 'Close', { duration: 3000 });
          this.loadAssignments();
          this.loadService();
        },
        error: (err) => {
          console.error('Error revoking:', err);
          this.snackBar.open('Failed to revoke service', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleAssignment(assignment: TenantAssignment, event: Event): void {
    event.stopPropagation();

    const newStatus = !assignment.is_active;
    this.agenticService.updateAssignment(
      this.serviceId, assignment.tenant_id, { is_active: newStatus }
    ).subscribe({
      next: () => {
        const action = newStatus ? 'activated' : 'deactivated';
        this.snackBar.open(`Assignment ${action}`, 'Close', { duration: 3000 });
        this.loadAssignments();
      },
      error: (err) => {
        console.error('Error toggling assignment:', err);
        this.snackBar.open('Failed to update assignment', 'Close', { duration: 3000 });
      }
    });
  }

  editConfig(assignment: TenantAssignment, event: Event): void {
    event.stopPropagation();

    const currentConfig = assignment.config ? JSON.stringify(assignment.config, null, 2) : '';
    const newConfigStr = prompt(
      'Edit config JSON for tenant ' + assignment.tenant_id + ':\n\n'
      + 'Example: {"triggers": ["cpu","memory","pod"], "query_endpoint": "/api/v1/observe/query", "timeout_seconds": 120}',
      currentConfig
    );

    if (newConfigStr === null) return; // cancelled

    let config: Record<string, any> | undefined;
    if (newConfigStr.trim()) {
      try {
        config = JSON.parse(newConfigStr);
      } catch (e) {
        this.snackBar.open('Invalid JSON', 'Close', { duration: 3000 });
        return;
      }
    }

    this.agenticService.updateAssignment(
      this.serviceId, assignment.tenant_id, { config }
    ).subscribe({
      next: () => {
        this.snackBar.open('Config updated', 'Close', { duration: 3000 });
        this.loadAssignments();
      },
      error: (err) => {
        const msg = err.error?.detail || 'Failed to update config';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  formatConfig(config: Record<string, any> | null): string {
    if (!config) return '—';
    return JSON.stringify(config, null, 2);
  }

  goBack(): void {
    this.router.navigate(['/services']);
  }
}
