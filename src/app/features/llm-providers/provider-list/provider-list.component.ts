import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  LLMProviderService,
  LLMProvider
} from '../services/llm-provider.service';
import { ProviderFormDialogComponent } from '../provider-form-dialog/provider-form-dialog.component';

@Component({
  selector: 'app-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.css']
})
export class ProviderListComponent implements OnInit {
  displayedColumns = ['provider', 'model_id', 'display_name', 'base_url', 'api_key_info', 'status', 'created_at', 'actions'];
  dataSource: LLMProvider[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private llmProviderService: LLMProviderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.loading = true;
    this.error = null;

    this.llmProviderService.getProviders(false).subscribe({
      next: (providers) => {
        this.dataSource = Array.isArray(providers) ? providers : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading LLM providers:', err);
        this.error = 'Failed to load LLM providers.';
        this.dataSource = [];
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProviderFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProviders();
      }
    });
  }

  openEditDialog(provider: LLMProvider, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ProviderFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', provider }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProviders();
      }
    });
  }

  deleteProvider(provider: LLMProvider, event: Event): void {
    event.stopPropagation();

    if (confirm(`Delete LLM provider "${provider.display_name}"?`)) {
      this.llmProviderService.deleteProvider(provider.id).subscribe({
        next: () => {
          this.snackBar.open('Provider deleted successfully', 'Close', { duration: 3000 });
          this.loadProviders();
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to delete provider';
          this.snackBar.open(msg, 'Close', { duration: 5000 });
        }
      });
    }
  }

  getProviderIcon(provider: string): string {
    switch (provider) {
      case 'openai': return 'auto_awesome';
      case 'anthropic': return 'psychology';
      case 'ollama': return 'computer';
      case 'azure': return 'cloud';
      default: return 'smart_toy';
    }
  }
}
