import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BillingService,
  Subscription,
  PlanMigrationPreviewResponse
} from '../services/billing.service';
import { PlanService, Plan } from '../../plans/services/plan.service';

@Component({
  selector: 'app-migrate-plan-dialog',
  templateUrl: './migrate-plan-dialog.component.html',
  styleUrls: ['./migrate-plan-dialog.component.css']
})
export class MigratePlanDialogComponent implements OnInit {
  migrationForm: FormGroup;
  plans: Plan[] = [];
  loadingPlans = true;
  preview: PlanMigrationPreviewResponse | null = null;
  loadingPreview = false;
  previewError: string | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private billingService: BillingService,
    private planService: PlanService,
    private dialogRef: MatDialogRef<MigratePlanDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { subscription: Subscription }
  ) {
    this.migrationForm = this.fb.group({
      new_plan_id: ['', Validators.required],
      billing_cycle: [this.data.subscription.billing_cycle || 'monthly'],
      payment_amount: [0, [Validators.required, Validators.min(0)]],
      payment_method: ['bank_transfer', Validators.required],
      reference_number: [''],
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPlans();

    this.migrationForm.get('new_plan_id')?.valueChanges.subscribe(planId => {
      if (planId) {
        this.loadPreview();
      } else {
        this.preview = null;
        this.previewError = null;
      }
    });

    this.migrationForm.get('billing_cycle')?.valueChanges.subscribe(() => {
      if (this.migrationForm.get('new_plan_id')?.value) {
        this.loadPreview();
      }
    });
  }

  loadPlans(): void {
    this.loadingPlans = true;
    this.planService.getPlans().subscribe({
      next: (response) => {
        let allPlans: Plan[] = [];
        if (Array.isArray(response)) {
          allPlans = response;
        } else if (response && (response as any).items) {
          allPlans = (response as any).items;
        } else if (response && (response as any).plans) {
          allPlans = (response as any).plans;
        } else if (response && (response as any).data) {
          allPlans = (response as any).data;
        }

        // Filter out current plan and inactive/deleted plans
        this.plans = allPlans.filter(p =>
          p.id !== this.data.subscription.plan_id && p.is_active && !p.is_deleted
        );
        this.loadingPlans = false;
      },
      error: (err) => {
        console.error('Error loading plans:', err);
        this.snackBar.open('Failed to load plans', 'Close', { duration: 3000 });
        this.loadingPlans = false;
      }
    });
  }

  loadPreview(): void {
    this.loadingPreview = true;
    this.previewError = null;
    this.preview = null;

    const data = {
      new_plan_id: this.migrationForm.get('new_plan_id')?.value,
      billing_cycle: this.migrationForm.get('billing_cycle')?.value || undefined
    };

    this.billingService.previewPlanMigration(this.data.subscription.id, data).subscribe({
      next: (result) => {
        this.preview = result;
        this.migrationForm.patchValue({
          payment_amount: result.recommended_payment
        });
        this.loadingPreview = false;
      },
      error: (err) => {
        console.error('Error loading preview:', err);
        this.previewError = err.error?.detail || 'Failed to load migration preview';
        this.loadingPreview = false;
      }
    });
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onSubmit(): void {
    if (this.migrationForm.invalid || !this.preview) {
      return;
    }

    this.submitting = true;
    const formValue = this.migrationForm.value;

    this.billingService.executePlanMigration(this.data.subscription.id, {
      new_plan_id: formValue.new_plan_id,
      payment_amount: formValue.payment_amount,
      payment_method: formValue.payment_method,
      reference_number: formValue.reference_number || undefined,
      reason: formValue.reason,
      billing_cycle: formValue.billing_cycle || undefined,
      notes: formValue.notes || undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('Plan migration completed successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error executing migration:', err);
        this.snackBar.open(
          err.error?.detail || 'Failed to execute plan migration',
          'Close',
          { duration: 5000 }
        );
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
