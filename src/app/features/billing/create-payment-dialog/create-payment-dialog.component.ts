import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BillingService, CreatePaymentRequest } from '../services/billing.service';
import { TenantService } from '../../tenants/services/tenant.service';

@Component({
  selector: 'app-create-payment-dialog',
  templateUrl: './create-payment-dialog.component.html',
  styleUrls: ['./create-payment-dialog.component.css']
})
export class CreatePaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  submitting = false;
  tenants: { id: string; name: string }[] = [];
  loadingTenants = true;
  subscription: any = null;
  loadingSubscription = false;
  subscriptionError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private billingService: BillingService,
    private tenantService: TenantService,
    private dialogRef: MatDialogRef<CreatePaymentDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.paymentForm = this.fb.group({
      tenant_id: ['', Validators.required],
      subscription_id: [{ value: '', disabled: true }],
      amount: ['', [Validators.required, Validators.min(0)]],
      payment_method: ['bank_transfer', Validators.required],
      payment_date: [new Date(), Validators.required],
      reference_number: [''],
      notes: ['', Validators.required],
      should_extend_subscription: [true],
      extension_days: [30, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadTenants();

    // Listen to tenant_id changes
    this.paymentForm.get('tenant_id')?.valueChanges.subscribe(tenantId => {
      if (tenantId) {
        this.loadSubscriptionForTenant(tenantId);
      } else {
        this.clearSubscription();
      }
    });
  }

  loadTenants(): void {
    this.loadingTenants = true;
    this.tenantService.getTenantDropdown().subscribe({
      next: (response) => {
        console.log('Tenant dropdown API response:', response);

        // Handle different response formats
        if (Array.isArray(response)) {
          this.tenants = response;
        } else if (response && (response as any).tenants) {
          this.tenants = (response as any).tenants;
        } else if (response && (response as any).data) {
          this.tenants = (response as any).data;
        } else {
          this.tenants = [];
        }

        console.log('Loaded tenants:', this.tenants.length);
        this.loadingTenants = false;
      },
      error: (err) => {
        console.error('Error loading tenants:', err);
        this.snackBar.open('Failed to load tenants list', 'Close', { duration: 3000 });
        this.loadingTenants = false;
      }
    });
  }

  loadSubscriptionForTenant(tenantId: string): void {
    this.loadingSubscription = true;
    this.subscriptionError = null;
    this.subscription = null;

    this.billingService.getSubscriptionByTenantId(tenantId).subscribe({
      next: (response: { subscription: any; data: any; }) => {
        console.log('Subscription API response:', response);

        // Extract subscription from response
        if (response?.subscription) {
          this.subscription = response.subscription;
        } else if (response?.data) {
          this.subscription = response.data;
        } else {
          this.subscription = response;
        }

        // Populate subscription_id in form
        if (this.subscription?.id) {
          this.paymentForm.patchValue({
            subscription_id: this.subscription.id
          });
        } else {
          this.subscriptionError = 'No active subscription found for this tenant';
        }

        this.loadingSubscription = false;
      },
      error: (err: any) => {
        console.error('Error loading subscription:', err);
        this.subscriptionError = 'Failed to load subscription details';
        this.loadingSubscription = false;
      }
    });
  }

  clearSubscription(): void {
    this.subscription = null;
    this.subscriptionError = null;
    this.paymentForm.patchValue({
      subscription_id: ''
    });
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = currency === 'NGN' ? '₦' : currency;
    return symbol + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatCycle(cycle: string): string {
    return cycle.charAt(0).toUpperCase() + cycle.slice(1);
  }

  formatPaymentMethod(method: string): string {
    return method.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.submitting = true;

    // Get form value including disabled fields
    const formValue = this.paymentForm.getRawValue();

    // Format payment_date to ISO string
    const payment: CreatePaymentRequest = {
      ...formValue,
      payment_date: formValue.payment_date instanceof Date
        ? formValue.payment_date.toISOString()
        : formValue.payment_date
    };

    this.billingService.createPayment(payment).subscribe({
      next: () => {
        this.snackBar.open('Payment created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error creating payment:', err);
        this.snackBar.open('Failed to create payment', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
