import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AgenticServiceService,
  AgenticService,
  CreateServiceRequest,
  UpdateServiceRequest
} from '../services/agentic-service.service';

@Component({
  selector: 'app-service-form-dialog',
  templateUrl: './service-form-dialog.component.html',
  styleUrls: ['./service-form-dialog.component.css']
})
export class ServiceFormDialogComponent implements OnInit {
  serviceForm: FormGroup;
  submitting = false;
  mode: 'create' | 'edit' = 'create';
  service?: AgenticService;

  categories = ['agentic', 'integration', 'analytics'];

  constructor(
    private fb: FormBuilder,
    private agenticService: AgenticServiceService,
    private dialogRef: MatDialogRef<ServiceFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data?.mode || 'create';
    this.service = data?.service;

    this.serviceForm = this.fb.group({
      name: [this.service?.name || '', Validators.required],
      service_key: [
        { value: this.service?.service_key || '', disabled: this.mode === 'edit' },
        [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/)]
      ],
      description: [this.service?.description || ''],
      base_url: [this.service?.base_url || ''],
      health_check_url: [this.service?.health_check_url || ''],
      category: [this.service?.category || 'agentic', Validators.required],
      icon_url: [this.service?.icon_url || ''],
      capabilities: [this.service?.capabilities ? JSON.stringify(this.service.capabilities, null, 2) : ''],
      ui_hints: [this.service?.ui_hints ? JSON.stringify(this.service.ui_hints, null, 2) : '']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValue = this.serviceForm.getRawValue();

    // Parse JSON string fields
    if (formValue.capabilities && typeof formValue.capabilities === 'string') {
      try {
        formValue.capabilities = JSON.parse(formValue.capabilities);
      } catch {
        formValue.capabilities = undefined;
      }
    }
    if (formValue.ui_hints && typeof formValue.ui_hints === 'string') {
      try {
        formValue.ui_hints = JSON.parse(formValue.ui_hints);
      } catch {
        formValue.ui_hints = undefined;
      }
    }

    const request = this.mode === 'create'
      ? this.agenticService.createService(formValue as CreateServiceRequest)
      : this.agenticService.updateService(this.service!.id, formValue as UpdateServiceRequest);

    request.subscribe({
      next: () => {
        const action = this.mode === 'create' ? 'registered' : 'updated';
        this.snackBar.open(`Service ${action} successfully`, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error saving service:', err);
        const msg = err.error?.detail || 'Failed to save service';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
