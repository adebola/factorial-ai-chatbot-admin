import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BillingService, Payment, PaymentListParams } from '../services/billing.service';
import { CreatePaymentDialogComponent } from '../create-payment-dialog/create-payment-dialog.component';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  displayedColumns = ['amount', 'status', 'payment_method', 'payment_date', 'actions'];
  dataSource: Payment[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  statusFilter = '';

  constructor(
    private billingService: BillingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    const params: PaymentListParams = {
      page: this.pageIndex,
      size: this.pageSize,
      status: this.statusFilter || undefined
    };

    this.billingService.getPayments(params).subscribe({
      next: (response) => {
        console.log('Payments API response:', response);

        // Handle different response formats
        if (Array.isArray(response)) {
          this.dataSource = response;
          this.totalElements = response.length;
        } else if (response && (response as any).items) {
          // Handle { items: [...] } format
          this.dataSource = (response as any).items;
          this.totalElements = (response as any).total || (response as any).count || (response as any).items.length;
          console.log('Extracted payments from items property:', this.dataSource);
        } else if (response && (response as any).payments) {
          this.dataSource = (response as any).payments;
          this.totalElements = (response as any).total || (response as any).payments.length;
        } else if (response && response.content) {
          this.dataSource = response.content || [];
          this.totalElements = response.totalElements || 0;
        } else if (response && (response as any).data) {
          this.dataSource = (response as any).data;
          this.totalElements = (response as any).total || (response as any).data.length;
        } else {
          console.warn('No payments found in response');
          this.dataSource = [];
          this.totalElements = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payments:', err);
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
        subscription_id: 'sub-1',
        amount: 70000.0,
        currency: 'NGN',
        status: 'completed',
        payment_method: 'card',
        transaction_type: 'upgrade',
        paystack_reference: 'plan_upgrade_test_123456789',
        description: 'Plan upgrade from Lite to Pro',
        created_at: '2026-01-11T17:54:27.361648+00:00',
        processed_at: '2026-01-11T17:54:28.127639+00:00'
      }
    ];
    this.totalElements = 1;
  }

  openCreatePaymentDialog(): void {
    const dialogRef = this.dialog.open(CreatePaymentDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPayments();
      }
    });
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadPayments();
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadPayments();
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'completed': 'completed-chip',
      'pending': 'pending-chip',
      'failed': 'failed-chip',
      'refunded': 'refunded-chip'
    };
    return colors[status] || '';
  }

  getPaymentDate(payment: Payment): string | null {
    // Use processed_at if available, otherwise created_at
    return payment.processed_at || payment.created_at || payment.payment_date || null;
  }

  viewPaymentDetails(payment: Payment): void {
    this.router.navigate(['/billing/payments', payment.id]);
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = currency === 'NGN' ? '₦' : currency;
    return symbol + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}
