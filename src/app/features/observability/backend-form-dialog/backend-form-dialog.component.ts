import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ObservabilityService,
  ObservabilityBackend,
  CreateBackendRequest,
  UpdateBackendRequest
} from '../services/observability.service';

@Component({
  selector: 'app-backend-form-dialog',
  templateUrl: './backend-form-dialog.component.html',
  styleUrls: ['./backend-form-dialog.component.css']
})
export class BackendFormDialogComponent implements OnInit {
  backendForm: FormGroup;
  submitting = false;
  mode: 'create' | 'edit' = 'create';
  backend?: ObservabilityBackend;
  tenants: { id: string; name: string }[] = [];

  backendTypes = [
    { value: 'prometheus', label: 'Prometheus' },
    { value: 'elasticsearch', label: 'Elasticsearch' },
    { value: 'jaeger', label: 'Jaeger / Tempo' },
    { value: 'alertmanager', label: 'AlertManager' },
    { value: 'otel_collector', label: 'OTel Collector' },
    { value: 'k8s', label: 'Kubernetes' },
    { value: 'llm', label: 'LLM Provider' }
  ];

  authTypes = [
    { value: 'none', label: 'None' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'service_account', label: 'Service Account' }
  ];

  showCredentials = false;

  constructor(
    private fb: FormBuilder,
    private observabilityService: ObservabilityService,
    private dialogRef: MatDialogRef<BackendFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data?.mode || 'create';
    this.backend = data?.backend;
    this.tenants = data?.tenants || [];

    this.backendForm = this.fb.group({
      tenant_id: [
        { value: this.backend?.tenant_id || '', disabled: this.mode === 'edit' },
        Validators.required
      ],
      backend_type: [
        { value: this.backend?.backend_type || '', disabled: this.mode === 'edit' },
        Validators.required
      ],
      url: [this.backend?.url || '', Validators.required],
      auth_type: [this.backend?.auth_type || 'none', Validators.required],
      verify_ssl: [this.backend?.verify_ssl ?? true],
      timeout_seconds: [this.backend?.timeout_seconds || 30, [Validators.required, Validators.min(1), Validators.max(120)]],
      credentials_json: [''],
      is_active: [this.backend?.is_active ?? true]
    });
  }

  ngOnInit(): void {
    this.backendForm.get('auth_type')?.valueChanges.subscribe(authType => {
      this.showCredentials = authType !== 'none';
    });
    this.showCredentials = this.backendForm.get('auth_type')?.value !== 'none';
  }

  getCredentialsHint(): string {
    const authType = this.backendForm.get('auth_type')?.value;
    switch (authType) {
      case 'basic': return '{"username": "user", "password": "pass"}';
      case 'bearer': return '{"token": "your-bearer-token"}';
      case 'service_account': return '{"token": "k8s-service-account-token"}';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.backendForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValue = this.backendForm.getRawValue();

    // Parse credentials JSON if provided
    let credentials: Record<string, any> | undefined;
    if (formValue.credentials_json && formValue.credentials_json.trim()) {
      try {
        credentials = JSON.parse(formValue.credentials_json);
      } catch (e) {
        this.snackBar.open('Invalid credentials JSON', 'Close', { duration: 3000 });
        this.submitting = false;
        return;
      }
    }

    if (this.mode === 'create') {
      const request: CreateBackendRequest = {
        tenant_id: formValue.tenant_id,
        backend_type: formValue.backend_type,
        url: formValue.url,
        auth_type: formValue.auth_type,
        credentials,
        verify_ssl: formValue.verify_ssl,
        timeout_seconds: formValue.timeout_seconds
      };

      this.observabilityService.createBackend(request).subscribe({
        next: () => {
          this.snackBar.open('Backend created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to create backend';
          this.snackBar.open(msg, 'Close', { duration: 5000 });
          this.submitting = false;
        }
      });
    } else {
      const request: UpdateBackendRequest = {
        url: formValue.url,
        auth_type: formValue.auth_type,
        credentials,
        verify_ssl: formValue.verify_ssl,
        timeout_seconds: formValue.timeout_seconds,
        is_active: formValue.is_active
      };

      this.observabilityService.updateBackend(
        this.backend!.tenant_id, this.backend!.backend_type, request
      ).subscribe({
        next: () => {
          this.snackBar.open('Backend updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to update backend';
          this.snackBar.open(msg, 'Close', { duration: 5000 });
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
