import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import {
  RagInspectorService,
  RagInspectResponse,
  RagInspectChunk
} from '../services/rag-inspector.service';
import { TenantService } from '../../tenants/services/tenant.service';

interface TenantOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-rag-inspector',
  templateUrl: './rag-inspector.component.html',
  styleUrls: ['./rag-inspector.component.css']
})
export class RagInspectorComponent implements OnInit {
  form: FormGroup;
  tenants: TenantOption[] = [];
  loadingTenants = false;
  loading = false;
  response: RagInspectResponse | null = null;
  expanded: { [chunkId: string]: boolean } = {};

  readonly displayedColumns = [
    'rank',
    'distance',
    'source_name',
    'section_title',
    'actions'
  ];

  constructor(
    private fb: FormBuilder,
    private ragService: RagInspectorService,
    private tenantService: TenantService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      tenant_id: ['', Validators.required],
      query: ['', [Validators.required, Validators.minLength(1)]],
      k: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      max_distance: [
        1.5,
        [Validators.required, Validators.min(0), Validators.max(2)]
      ]
    });
  }

  ngOnInit(): void {
    this.loadTenants();
  }

  private loadTenants(): void {
    this.loadingTenants = true;
    this.tenantService.getTenantDropdown()
      .pipe(finalize(() => (this.loadingTenants = false)))
      .subscribe({
        next: (list) => {
          this.tenants = (list || []).slice().sort((a, b) =>
            (a.name || '').localeCompare(b.name || '')
          );
        },
        error: (err) => {
          this.snackBar.open(
            `Failed to load tenants: ${err?.error?.detail || err.message}`,
            'Dismiss',
            { duration: 6000 }
          );
        }
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.response = null;
    this.expanded = {};
    this.ragService.inspect(this.form.value)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp) => {
          this.response = resp;
        },
        error: (err) => {
          const detail = err?.error?.detail || err.message || 'Unknown error';
          this.snackBar.open(`Inspect failed: ${detail}`, 'Dismiss', {
            duration: 8000
          });
        }
      });
  }

  reset(): void {
    this.form.reset({
      tenant_id: '',
      query: '',
      k: 10,
      max_distance: 1.5
    });
    this.response = null;
    this.expanded = {};
  }

  toggleRow(chunk: RagInspectChunk): void {
    this.expanded[chunk.chunk_id] = !this.expanded[chunk.chunk_id];
  }

  distanceClass(chunk: RagInspectChunk): string {
    const threshold = this.form.value.max_distance ?? 1.5;
    if (chunk.distance < threshold * 0.66) {
      return 'distance-good';
    }
    if (chunk.distance < threshold) {
      return 'distance-warn';
    }
    return 'distance-dropped';
  }

  copyChunkContent(chunk: RagInspectChunk, event: MouseEvent): void {
    event.stopPropagation();
    navigator.clipboard
      .writeText(chunk.content_preview)
      .then(() =>
        this.snackBar.open('Chunk content copied', '', { duration: 2000 })
      )
      .catch(() =>
        this.snackBar.open('Copy failed', 'Dismiss', { duration: 3000 })
      );
  }
}
