import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BillingService, CustomLimitsResponse, Subscription } from '../services/billing.service';

@Component({
  selector: 'app-custom-limits-dialog',
  templateUrl: './custom-limits-dialog.component.html',
  styleUrls: ['./custom-limits-dialog.component.css']
})
export class CustomLimitsDialogComponent implements OnInit {
  limitsForm: FormGroup;
  loading = true;
  submitting = false;
  limitsData: CustomLimitsResponse | null = null;
  changed = false;

  limitFields = [
    { key: 'document_limit', label: 'Document Limit' },
    { key: 'website_limit', label: 'Website Limit' },
    { key: 'daily_chat_limit', label: 'Daily Chat Limit' },
    { key: 'monthly_chat_limit', label: 'Monthly Chat Limit' },
    { key: 'max_document_size_mb', label: 'Max Document Size (MB)' },
    { key: 'max_pages_per_website', label: 'Max Pages Per Website' },
  ];

  constructor(
    private fb: FormBuilder,
    private billingService: BillingService,
    private dialogRef: MatDialogRef<CustomLimitsDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { subscription: Subscription }
  ) {
    this.limitsForm = this.fb.group({
      document_limit: [null],
      website_limit: [null],
      daily_chat_limit: [null],
      monthly_chat_limit: [null],
      max_document_size_mb: [null],
      max_pages_per_website: [null],
      reason: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCustomLimits();
  }

  loadCustomLimits(): void {
    this.loading = true;
    this.billingService.getCustomLimits(this.data.subscription.id).subscribe({
      next: (response) => {
        this.limitsData = response;
        // Populate form with custom overrides (if any)
        if (response.custom_limits) {
          for (const field of this.limitFields) {
            if (response.custom_limits[field.key] !== undefined) {
              this.limitsForm.patchValue({ [field.key]: response.custom_limits[field.key] });
            }
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading custom limits:', err);
        this.snackBar.open('Failed to load custom limits', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getPlaceholder(key: string): string {
    if (!this.limitsData?.plan_limits) return '';
    const val = this.limitsData.plan_limits[key];
    if (val === -1) return 'Unlimited';
    if (val === null || val === undefined) return 'Not set';
    return val.toString();
  }

  formatLimitDisplay(val: number | null | undefined): string {
    if (val === -1) return 'Unlimited';
    if (val === null || val === undefined) return 'N/A';
    return val.toString();
  }

  onSave(): void {
    if (this.limitsForm.invalid) return;

    this.submitting = true;
    const formValue = this.limitsForm.value;

    // Build overrides from only the fields that have values
    const overrides: Record<string, number> = {};
    for (const field of this.limitFields) {
      const val = formValue[field.key];
      if (val !== null && val !== undefined && val !== '') {
        overrides[field.key] = Number(val);
      }
    }

    if (Object.keys(overrides).length === 0) {
      this.snackBar.open('No limit overrides specified', 'Close', { duration: 3000 });
      this.submitting = false;
      return;
    }

    this.billingService.overrideSubscription(this.data.subscription.id, {
      usage_limit_overrides: overrides,
      reason: formValue.reason
    }).subscribe({
      next: () => {
        this.snackBar.open('Custom limits saved successfully', 'Close', { duration: 3000 });
        this.changed = true;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error saving custom limits:', err);
        this.snackBar.open('Failed to save custom limits', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  onResetToDefaults(): void {
    if (!confirm('Reset all custom limits to plan defaults? This cannot be undone.')) {
      return;
    }

    this.submitting = true;
    this.billingService.clearCustomLimits(this.data.subscription.id).subscribe({
      next: () => {
        this.snackBar.open('Custom limits cleared. Using plan defaults.', 'Close', { duration: 3000 });
        this.changed = true;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error clearing custom limits:', err);
        this.snackBar.open('Failed to clear custom limits', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(this.changed);
  }
}
