import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgenticServiceService, AgenticService } from '../services/agentic-service.service';
import { ServiceFormDialogComponent } from '../service-form-dialog/service-form-dialog.component';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {
  displayedColumns = ['name', 'service_key', 'category', 'base_url', 'tenant_count', 'status', 'actions'];
  dataSource: AgenticService[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private agenticService: AgenticServiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.error = null;

    this.agenticService.getServices(true).subscribe({
      next: (services) => {
        this.dataSource = Array.isArray(services) ? services : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error = 'Failed to load services.';
        this.dataSource = [];
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ServiceFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServices();
      }
    });
  }

  openEditDialog(service: AgenticService, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ServiceFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', service }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServices();
      }
    });
  }

  viewDetail(service: AgenticService): void {
    this.router.navigate(['/services', service.id]);
  }

  deleteService(service: AgenticService, event: Event): void {
    event.stopPropagation();

    if (confirm(`Delete service "${service.name}"? This will soft-delete it.`)) {
      this.agenticService.deleteService(service.id).subscribe({
        next: () => {
          this.snackBar.open('Service deleted successfully', 'Close', { duration: 3000 });
          this.loadServices();
        },
        error: (err) => {
          console.error('Error deleting service:', err);
          this.snackBar.open('Failed to delete service', 'Close', { duration: 3000 });
        }
      });
    }
  }

  runHealthCheck(service: AgenticService, event: Event): void {
    event.stopPropagation();

    if (!service.health_check_url) {
      this.snackBar.open('No health check URL configured for this service', 'Close', { duration: 3000 });
      return;
    }

    this.agenticService.healthCheck(service.health_check_url).subscribe({
      next: (result) => {
        let msg: string;
        if (result.status === 'healthy') {
          msg = result.latency_ms != null ? `Healthy (${result.latency_ms}ms)` : 'Healthy';
        } else if (result.status === 'unreachable') {
          msg = `Unreachable: ${result.error || 'Unknown error'}`;
        } else {
          msg = result.status_code ? `Unhealthy (HTTP ${result.status_code})` : `Status: ${result.status}`;
        }
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      },
      error: (err) => {
        console.error('Health check error:', err);
        this.snackBar.open('Health check failed', 'Close', { duration: 3000 });
      }
    });
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'agentic': return 'primary';
      case 'integration': return 'accent';
      case 'analytics': return 'warn';
      default: return '';
    }
  }
}
