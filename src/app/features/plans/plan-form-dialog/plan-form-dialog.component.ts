import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanService, Plan, CreatePlanRequest, UpdatePlanRequest } from '../services/plan.service';

@Component({
  selector: 'app-plan-form-dialog',
  templateUrl: './plan-form-dialog.component.html',
  styleUrls: ['./plan-form-dialog.component.css']
})
export class PlanFormDialogComponent implements OnInit {
  planForm: FormGroup;
  submitting = false;
  mode: 'create' | 'edit' = 'create';
  plan?: Plan;

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private dialogRef: MatDialogRef<PlanFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data?.mode || 'create';
    this.plan = data?.plan;

    this.planForm = this.fb.group({
      name: [this.plan?.name || '', Validators.required],
      description: [this.plan?.description || '', Validators.required],
      document_limit: [this.plan?.document_limit ?? 1, [Validators.required, Validators.min(-1)]],
      website_limit: [this.plan?.website_limit ?? 1, [Validators.required, Validators.min(-1)]],
      daily_chat_limit: [this.plan?.daily_chat_limit ?? 20, [Validators.required, Validators.min(-1)]],
      monthly_chat_limit: [this.plan?.monthly_chat_limit ?? 500, [Validators.required, Validators.min(-1)]],
      monthly_plan_cost: [this.plan?.monthly_plan_cost || '0.00', Validators.required],
      yearly_plan_cost: [this.plan?.yearly_plan_cost || '0.00', Validators.required],
      features: this.fb.array(
        (this.plan?.features && Array.isArray(this.plan.features))
          ? this.plan.features.map(f => this.fb.control(f))
          : [this.fb.control('')]
      )
    });
  }

  ngOnInit(): void {}

  get features(): FormArray {
    return this.planForm.get('features') as FormArray;
  }

  addFeature(): void {
    this.features.push(this.fb.control(''));
  }

  removeFeature(index: number): void {
    this.features.removeAt(index);
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValue = this.planForm.value;
    const planData = {
      ...formValue,
      features: formValue.features.filter((f: string) => f.trim() !== '')
    };

    const request = this.mode === 'create'
      ? this.planService.createPlan(planData as CreatePlanRequest)
      : this.planService.updatePlan(this.plan!.id, planData as UpdatePlanRequest);

    request.subscribe({
      next: () => {
        const action = this.mode === 'create' ? 'created' : 'updated';
        this.snackBar.open(`Plan ${action} successfully`, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error saving plan:', err);
        this.snackBar.open('Failed to save plan', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
