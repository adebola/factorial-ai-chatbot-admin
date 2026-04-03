import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  LLMProviderService,
  LLMProvider,
  CreateLLMProviderRequest,
  UpdateLLMProviderRequest
} from '../services/llm-provider.service';

@Component({
  selector: 'app-provider-form-dialog',
  templateUrl: './provider-form-dialog.component.html',
  styleUrls: ['./provider-form-dialog.component.css']
})
export class ProviderFormDialogComponent {
  providerForm: FormGroup;
  submitting = false;
  mode: 'create' | 'edit' = 'create';
  provider?: LLMProvider;

  providerTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'ollama', label: 'Ollama (Local)' },
    { value: 'azure', label: 'Azure OpenAI' }
  ];

  constructor(
    private fb: FormBuilder,
    private llmProviderService: LLMProviderService,
    private dialogRef: MatDialogRef<ProviderFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data?.mode || 'create';
    this.provider = data?.provider;

    this.providerForm = this.fb.group({
      provider: [
        { value: this.provider?.provider || '', disabled: this.mode === 'edit' },
        Validators.required
      ],
      model_id: [
        { value: this.provider?.model_id || '', disabled: this.mode === 'edit' },
        Validators.required
      ],
      display_name: [this.provider?.display_name || '', Validators.required],
      base_url: [this.provider?.base_url || ''],
      api_key: [''],
      requires_api_key: [this.provider?.requires_api_key ?? true],
      is_active: [this.provider?.is_active ?? true],
      // Context window configuration
      max_context_tokens: [this.provider?.max_context_tokens || 128000, [Validators.min(1)]],
      context_limit_tokens: [this.provider?.context_limit_tokens || 80000, [Validators.min(1)]],
      max_response_tokens: [this.provider?.max_response_tokens || 4096, [Validators.min(1)]],
      cost_per_input_token: [this.provider?.cost_per_input_token || 0, [Validators.min(0)]],
      cost_per_output_token: [this.provider?.cost_per_output_token || 0, [Validators.min(0)]]
    });
  }

  getBaseUrlHint(): string {
    const provider = this.providerForm.get('provider')?.value;
    switch (provider) {
      case 'ollama': return 'e.g. http://localhost:11434';
      case 'azure': return 'e.g. https://your-resource.openai.azure.com';
      default: return 'Leave empty for default API endpoint';
    }
  }

  onSubmit(): void {
    if (this.providerForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValue = this.providerForm.getRawValue();

    if (this.mode === 'create') {
      const request: CreateLLMProviderRequest = {
        provider: formValue.provider,
        model_id: formValue.model_id,
        display_name: formValue.display_name,
        base_url: formValue.base_url || undefined,
        api_key: formValue.api_key || undefined,
        requires_api_key: formValue.requires_api_key
      };

      this.llmProviderService.createProvider(request).subscribe({
        next: () => {
          this.snackBar.open('Provider created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to create provider';
          this.snackBar.open(msg, 'Close', { duration: 5000 });
          this.submitting = false;
        }
      });
    } else {
      const request: UpdateLLMProviderRequest = {
        display_name: formValue.display_name,
        base_url: formValue.base_url || undefined,
        api_key: formValue.api_key || undefined,
        requires_api_key: formValue.requires_api_key,
        is_active: formValue.is_active
      };

      this.llmProviderService.updateProvider(this.provider!.id, request).subscribe({
        next: () => {
          this.snackBar.open('Provider updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to update provider';
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
