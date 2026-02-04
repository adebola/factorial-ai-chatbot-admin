import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanService, Plan } from '../services/plan.service';
import { PlanFormDialogComponent } from '../plan-form-dialog/plan-form-dialog.component';

@Component({
  selector: 'app-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.css']
})
export class PlanListComponent implements OnInit {
  displayedColumns = ['name', 'monthly_cost', 'yearly_cost', 'limits', 'tenant_count', 'status', 'actions'];
  dataSource: Plan[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private planService: PlanService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.error = null;

    this.planService.getPlans().subscribe({
      next: (response) => {
        console.log('Plans API response:', response);

        // Handle different response formats
        if (Array.isArray(response)) {
          this.dataSource = response;
        } else if (response && (response as any).plans) {
          this.dataSource = (response as any).plans;
          console.log('Extracted plans from plans property:', this.dataSource);
        } else if (response && response.content) {
          this.dataSource = response.content || [];
        } else if (response && (response as any).data) {
          this.dataSource = (response as any).data;
        } else {
          console.warn('No plans found in response');
          this.dataSource = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading plans:', err);
        this.error = 'Failed to load plans. Using mock data.';
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.dataSource = [
      {
        id: '1',
        name: 'Basic',
        description: 'Perfect for getting started',
        document_limit: 1,
        website_limit: 1,
        daily_chat_limit: 20,
        monthly_chat_limit: 500,
        monthly_plan_cost: '50000.00',
        yearly_plan_cost: '500000.00',
        features: null,
        is_active: true,
        is_deleted: false,
        tenant_count: 15,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Pro',
        description: 'For growing businesses',
        document_limit: 5,
        website_limit: 3,
        daily_chat_limit: 100,
        monthly_chat_limit: 3000,
        monthly_plan_cost: '150000.00',
        yearly_plan_cost: '1500000.00',
        features: null,
        is_active: true,
        is_deleted: false,
        tenant_count: 25,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Enterprise',
        description: 'Custom solutions for large organizations',
        document_limit: -1,
        website_limit: -1,
        daily_chat_limit: -1,
        monthly_chat_limit: -1,
        monthly_plan_cost: '0.00',
        yearly_plan_cost: '0.00',
        features: null,
        is_active: true,
        is_deleted: false,
        tenant_count: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z'
      }
    ];
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PlanFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlans();
      }
    });
  }

  openEditDialog(plan: Plan, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(PlanFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', plan }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlans();
      }
    });
  }

  deletePlan(plan: Plan, event: Event): void {
    event.stopPropagation();

    if (confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) {
      this.planService.deletePlan(plan.id).subscribe({
        next: () => {
          this.snackBar.open('Plan deleted successfully', 'Close', { duration: 3000 });
          this.loadPlans();
        },
        error: (err) => {
          console.error('Error deleting plan:', err);
          this.snackBar.open('Failed to delete plan', 'Close', { duration: 3000 });
        }
      });
    }
  }

  togglePlanStatus(plan: Plan, event: Event): void {
    event.stopPropagation();

    const action = plan.is_active ? 'deactivate' : 'activate';
    const service = plan.is_active 
      ? this.planService.deactivatePlan(plan.id)
      : this.planService.activatePlan(plan.id);

    service.subscribe({
      next: () => {
        this.snackBar.open(`Plan ${action}d successfully`, 'Close', { duration: 3000 });
        this.loadPlans();
      },
      error: (err) => {
        console.error(`Error ${action}ing plan:`, err);
        this.snackBar.open(`Failed to ${action} plan`, 'Close', { duration: 3000 });
      }
    });
  }

  formatCost(cost: string): string {
    const amount = parseFloat(cost);
    if (amount === 0) {
      return 'Contact Sales';
    }
    return '₦' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  formatLimit(value: number): string {
    return value === -1 ? 'Unlimited' : value.toLocaleString();
  }

  getLimitsDisplay(plan: Plan): string {
    const limits = [];
    if (plan.document_limit !== -1) {
      limits.push(`${plan.document_limit} docs`);
    }
    if (plan.website_limit !== -1) {
      limits.push(`${plan.website_limit} sites`);
    }
    if (plan.monthly_chat_limit !== -1) {
      limits.push(`${plan.monthly_chat_limit.toLocaleString()} chats/mo`);
    }
    return limits.length > 0 ? limits.join(', ') : 'Unlimited';
  }
}
