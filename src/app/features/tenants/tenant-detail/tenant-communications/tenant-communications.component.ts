import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs';

import {
  WhatsAppAdminService,
  WhatsAppConfig,
  WhatsAppMessage,
} from '../../../whatsapp/services/whatsapp-admin.service';

@Component({
  selector: 'app-tenant-communications',
  templateUrl: './tenant-communications.component.html',
  styleUrls: ['./tenant-communications.component.css'],
})
export class TenantCommunicationsComponent implements OnChanges {
  @Input() tenantId!: string;

  loadingConfig = false;
  loadingMessages = false;
  config: WhatsAppConfig | null = null;
  messages: WhatsAppMessage[] = [];
  total = 0;
  page = 1;
  pageSize = 20;

  directionFilter = new FormControl<'inbound' | 'outbound' | null>(null);
  statusFilter = new FormControl<string | null>(null);

  readonly displayedColumns: string[] = [
    'created_at',
    'direction',
    'wa_id',
    'message',
    'status',
  ];

  constructor(
    private whatsappAdminService: WhatsAppAdminService,
    private snackBar: MatSnackBar
  ) {
    this.directionFilter.valueChanges.pipe(debounceTime(200)).subscribe(() => this.reloadMessages());
    this.statusFilter.valueChanges.pipe(debounceTime(200)).subscribe(() => this.reloadMessages());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tenantId'] && this.tenantId) {
      this.loadConfig();
      this.loadMessages();
    }
  }

  loadConfig(): void {
    this.loadingConfig = true;
    this.whatsappAdminService.getConfigForTenant(this.tenantId).subscribe({
      next: (config) => {
        this.config = config;
        this.loadingConfig = false;
      },
      error: () => {
        this.loadingConfig = false;
        this.snackBar.open('Could not load WhatsApp configuration.', 'Close', { duration: 4000 });
      },
    });
  }

  loadMessages(): void {
    this.loadingMessages = true;
    this.whatsappAdminService
      .listMessagesForTenant(this.tenantId, {
        page: this.page,
        size: this.pageSize,
        direction: this.directionFilter.value ?? undefined,
        status_filter: this.statusFilter.value ?? undefined,
      })
      .subscribe({
        next: (response) => {
          this.messages = response.messages;
          this.total = response.total;
          this.loadingMessages = false;
        },
        error: () => {
          this.loadingMessages = false;
          this.snackBar.open('Could not load WhatsApp messages.', 'Close', { duration: 4000 });
        },
      });
  }

  reloadMessages(): void {
    this.page = 1;
    this.loadMessages();
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadMessages();
  }

  truncate(value: string, max: number): string {
    if (!value) return '';
    return value.length > max ? value.slice(0, max - 1) + '…' : value;
  }
}
