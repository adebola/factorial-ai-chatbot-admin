import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BillingService, Subscription, SubscriptionListParams } from '../services/billing.service';
import { CustomLimitsDialogComponent } from '../custom-limits-dialog/custom-limits-dialog.component';
import { MigratePlanDialogComponent } from '../migrate-plan-dialog/migrate-plan-dialog.component';

@Component({
  selector: 'app-subscription-list',
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css']
})
export class SubscriptionListComponent implements OnInit {
  displayedColumns = ['user_full_name', 'amount', 'cycle', 'status', 'period', 'auto_renew', 'actions'];
  dataSource: Subscription[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  statusFilter = '';

  constructor(
    private billingService: BillingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    const params: SubscriptionListParams = {
      page: this.pageIndex,
      size: this.pageSize,
      status: this.statusFilter || undefined
    };

    this.billingService.getSubscriptions(params).subscribe({
      next: (response) => {
        console.log('Subscriptions API response:', response);

        // Handle different response formats
        if (Array.isArray(response)) {
          this.dataSource = response;
          this.totalElements = response.length;
        } else if (response && (response as any).items) {
          // Handle { items: [...] } format
          this.dataSource = (response as any).items;
          this.totalElements = (response as any).total || (response as any).count || (response as any).items.length;
          console.log('Extracted subscriptions from items property:', this.dataSource);
        } else if (response && (response as any).subscriptions) {
          this.dataSource = (response as any).subscriptions;
          this.totalElements = (response as any).total || (response as any).subscriptions.length;
        } else if (response && response.content) {
          this.dataSource = response.content || [];
          this.totalElements = response.totalElements || 0;
        } else if (response && (response as any).data) {
          this.dataSource = (response as any).data;
          this.totalElements = (response as any).total || (response as any).data.length;
        } else {
          console.warn('No subscriptions found in response');
          this.dataSource = [];
          this.totalElements = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading subscriptions:', err);
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
        plan_id: 'premium',
        plan_name: 'Premium Plan',
        status: 'active',
        billing_cycle: 'monthly',
        amount: 500000.0,
        currency: 'NGN',
        current_period_start: '2024-03-01T00:00:00Z',
        current_period_end: '2024-04-01T00:00:00Z',
        auto_renew: true,
        user_email: 'user1@example.com',
        user_full_name: 'John Doe',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-01T00:00:00Z'
      },
      {
        id: '2',
        tenant_id: 'tenant-2',
        tenant_name: 'Tech Innovations',
        plan_id: 'professional',
        plan_name: 'Professional Plan',
        status: 'active',
        billing_cycle: 'yearly',
        amount: 5000000.0,
        currency: 'NGN',
        current_period_start: '2024-02-15T00:00:00Z',
        current_period_end: '2024-03-15T00:00:00Z',
        auto_renew: true,
        user_email: 'user2@example.com',
        user_full_name: 'Jane Smith',
        created_at: '2024-02-10T09:15:00Z',
        updated_at: '2024-02-15T00:00:00Z'
      }
    ];
    this.totalElements = 2;
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadSubscriptions();
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadSubscriptions();
  }

  cancelSubscription(subscription: Subscription, event: Event): void {
    event.stopPropagation();
    if (confirm(`Cancel subscription for ${subscription.tenant_name}?`)) {
      this.billingService.cancelSubscription(subscription.id).subscribe({
        next: () => {
          this.snackBar.open('Subscription cancelled', 'Close', { duration: 3000 });
          this.loadSubscriptions();
        },
        error: () => {
          this.snackBar.open('Failed to cancel subscription', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'active': 'active-chip',
      'expired': 'expired-chip',
      'cancelled': 'cancelled-chip',
      'trial': 'trial-chip'
    };
    return colors[status] || '';
  }

  formatAmount(subscription: Subscription): string {
    const currency = subscription.currency || 'NGN';
    const amount = subscription.amount || 0;
    // Format with commas
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${currency} ${formattedAmount}`;
  }

  formatCycle(cycle: string): string {
    if (!cycle) return 'N/A';
    // Capitalize first letter
    return cycle.charAt(0).toUpperCase() + cycle.slice(1).toLowerCase();
  }

  openCustomLimitsDialog(subscription: Subscription): void {
    const dialogRef = this.dialog.open(CustomLimitsDialogComponent, {
      width: '650px',
      data: { subscription }
    });

    dialogRef.afterClosed().subscribe(changed => {
      if (changed) {
        this.loadSubscriptions();
      }
    });
  }

  openMigratePlanDialog(subscription: Subscription): void {
    const dialogRef = this.dialog.open(MigratePlanDialogComponent, {
      width: '650px',
      data: { subscription }
    });

    dialogRef.afterClosed().subscribe(changed => {
      if (changed) {
        this.loadSubscriptions();
      }
    });
  }
}
