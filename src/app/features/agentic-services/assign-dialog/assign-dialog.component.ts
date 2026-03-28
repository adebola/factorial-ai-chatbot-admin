import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgenticServiceService } from '../services/agentic-service.service';
import { TenantService } from '../../tenants/services/tenant.service';

@Component({
  selector: 'app-assign-dialog',
  templateUrl: './assign-dialog.component.html',
  styleUrls: ['./assign-dialog.component.css']
})
export class AssignDialogComponent implements OnInit {
  assignForm: FormGroup;
  submitting = false;
  serviceId: string;
  serviceName: string;
  tenants: { id: string; name: string }[] = [];
  loadingTenants = true;

  constructor(
    private fb: FormBuilder,
    private agenticService: AgenticServiceService,
    private tenantService: TenantService,
    private dialogRef: MatDialogRef<AssignDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.serviceId = data.serviceId;
    this.serviceName = data.serviceName || 'Service';

    this.assignForm = this.fb.group({
      tenant_id: ['', [Validators.required]],
      config: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loadingTenants = true;
    this.tenantService.getTenantDropdown().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.tenants = response;
        } else if (response && (response as any).tenants) {
          this.tenants = (response as any).tenants;
        } else if (response && (response as any).data) {
          this.tenants = (response as any).data;
        } else {
          this.tenants = [];
        }
        this.loadingTenants = false;
      },
      error: (err) => {
        console.error('Error loading tenants:', err);
        this.snackBar.open('Failed to load tenants', 'Close', { duration: 3000 });
        this.loadingTenants = false;
      }
    });
  }

  onSubmit(): void {
    if (this.assignForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValue = this.assignForm.value;

    let config = null;
    if (formValue.config && formValue.config.trim()) {
      try {
        config = JSON.parse(formValue.config);
      } catch (e) {
        this.snackBar.open('Invalid JSON in config field', 'Close', { duration: 3000 });
        this.submitting = false;
        return;
      }
    }

    this.agenticService.assignService(this.serviceId, {
      tenant_id: formValue.tenant_id,
      config: config,
      notes: formValue.notes || undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('Service assigned to tenant successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error assigning service:', err);
        const msg = err.error?.detail || 'Failed to assign service';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
