import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TenantService, TenantStatistics } from '../services/tenant.service';
import { TenantDetail } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-detail',
  templateUrl: './tenant-detail.component.html',
  styleUrls: ['./tenant-detail.component.css']
})
export class TenantDetailComponent implements OnInit {
  tenant: TenantDetail | null = null;
  statistics: TenantStatistics | null = null;
  subscription: any = null;
  loading = true;
  error: string | null = null;
  tenantId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('id') || '';
    if (this.tenantId) {
      this.loadTenantDetails();
      this.loadStatistics();
      this.loadSubscription();
    }
  }

  loadTenantDetails(): void {
    this.loading = true;
    this.tenantService.getTenantById(this.tenantId).subscribe({
      next: (response) => {
        console.log('Tenant detail API response:', response);
        console.log('Subscription data:', (response as any).subscription);
        console.log('Available fields:', Object.keys(response));

        // Check for different possible subscription field structures
        if (!(response as any).subscription && (response as any).subscriptionId) {
          console.log('Subscription ID found but no subscription object:', (response as any).subscriptionId);
          console.log('May need to fetch subscription separately or backend needs to include it');
        }

        this.tenant = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenant:', err);
        this.error = 'Failed to load tenant details';
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    this.tenantService.getTenantStatistics(this.tenantId).subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  loadSubscription(): void {
    this.tenantService.getTenantSubscription(this.tenantId).subscribe({
      next: (response) => {
        console.log('Subscription API response:', response);

        // Handle different response structures:
        // 1. Nested: { subscription: {...} }
        // 2. SuccessResponse wrapper: { success, message, data: {...} }
        // 3. Direct subscription object: { id, tenant_id, plan_id, ... }

        if (response?.subscription) {
          // Response has subscription nested under 'subscription' property
          this.subscription = response.subscription;
          console.log('Extracted subscription from subscription property:', this.subscription);
        } else if (response?.data) {
          // Response is wrapped in SuccessResponse
          this.subscription = response.data;
          console.log('Extracted subscription from data property:', this.subscription);
        } else if (response?.id && response?.tenant_id) {
          // Response is a direct subscription object
          this.subscription = response;
          console.log('Using direct subscription object:', this.subscription);
        } else {
          // No subscription data available
          console.log('No subscription found for tenant:', response?.message || 'No data');
          this.subscription = null;
        }
      },
      error: (err) => {
        console.error('Error loading subscription:', err);
        this.subscription = null;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }

  suspendTenant(): void {
    if (!this.tenant) return;
    
    if (confirm(`Are you sure you want to suspend tenant "${this.tenant.name}"?`)) {
      this.tenantService.suspendTenant(this.tenantId).subscribe({
        next: () => {
          this.snackBar.open('Tenant suspended', 'Close', { duration: 3000 });
          this.loadTenantDetails();
        },
        error: (err) => {
          this.snackBar.open('Failed to suspend tenant', 'Close', { duration: 3000 });
        }
      });
    }
  }

  activateTenant(): void {
    this.tenantService.activateTenant(this.tenantId).subscribe({
      next: () => {
        this.snackBar.open('Tenant activated', 'Close', { duration: 3000 });
        this.loadTenantDetails();
      },
      error: (err) => {
        this.snackBar.open('Failed to activate tenant', 'Close', { duration: 3000 });
      }
    });
  }

  copyApiKey(): void {
    if (!this.tenant?.apiKey) return;

    navigator.clipboard.writeText(this.tenant.apiKey).then(
      () => {
        this.snackBar.open('API Key copied to clipboard', 'Close', { duration: 2000 });
      },
      (err) => {
        console.error('Failed to copy API key:', err);
        this.snackBar.open('Failed to copy API key', 'Close', { duration: 2000 });
      }
    );
  }

  formatLastActivity(dateString: string): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Less than 1 hour ago
    if (diffMins < 60) {
      return diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
    }

    // Less than 24 hours ago
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    // Less than 7 days ago
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
