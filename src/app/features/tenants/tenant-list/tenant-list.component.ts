import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TenantService, TenantListParams } from '../services/tenant.service';
import { TenantSummary } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.css']
})
export class TenantListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'userCount', 'status', 'createdAt', 'actions'];
  dataSource: TenantSummary[] = [];

  loading = false;
  error: string | null = null;

  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  // Filters
  searchControl = new FormControl('');
  statusFilter: 'all' | 'active' | 'suspended' = 'all';

  constructor(
    private tenantService: TenantService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTenants();

    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadTenants();
      });
  }

  loadTenants(): void {
    this.loading = true;
    this.error = null;

    const params: TenantListParams = {
      page: this.pageIndex,
      size: this.pageSize,
      search: this.searchControl.value || undefined,
      status: this.statusFilter
    };

    this.tenantService.getTenants(params).subscribe({
      next: (response) => {
        console.log('Tenants API response:', response);

        // Handle different response formats
        if (Array.isArray(response)) {
          // API returned array directly
          this.dataSource = response;
          this.totalElements = response.length;
        } else if (response && (response as any).tenants) {
          // Backend format: { tenants: [...], total: N }
          this.dataSource = (response as any).tenants;
          this.totalElements = (response as any).total || (response as any).tenants.length;
        } else if (response && response.content) {
          // Spring Data Page format: { content: [...], totalElements: N }
          this.dataSource = Array.isArray(response.content) ? response.content : [];
          this.totalElements = response.totalElements || 0;
        } else if (response && (response as any).data) {
          // Alternative format: { data: [...], total: N }
          this.dataSource = (response as any).data;
          this.totalElements = (response as any).total || (response as any).data.length;
        } else {
          console.warn('Unexpected response format:', response);
          this.dataSource = [];
          this.totalElements = 0;
        }

        console.log('Processed dataSource:', this.dataSource);
        console.log('Total elements:', this.totalElements);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenants:', err);
        this.error = 'Failed to load tenants. Using mock data.';
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.dataSource = [
      {
        id: '1',
        name: 'Acme Corporation',
        domain: 'acme.chatcraft.cc',
        planId: 'premium',
        isActive: true,
        userCount: 50,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'Tech Innovations Inc',
        domain: 'techinnovations.chatcraft.cc',
        planId: 'professional',
        isActive: true,
        userCount: 25,
        createdAt: '2024-02-10T09:15:00Z',
        updatedAt: '2024-03-18T11:20:00Z'
      },
      {
        id: '3',
        name: 'Global Solutions Ltd',
        domain: 'globalsolutions.chatcraft.cc',
        planId: 'enterprise',
        isActive: false,
        userCount: 100,
        createdAt: '2024-01-05T08:00:00Z',
        updatedAt: '2024-03-15T16:45:00Z'
      }
    ];
    this.totalElements = 3;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadTenants();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.loadTenants();
  }

  viewTenant(tenant: TenantSummary): void {
    this.router.navigate(['/tenants', tenant.id]);
  }

  suspendTenant(tenant: TenantSummary, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to suspend tenant "${tenant.name}"?`)) {
      this.tenantService.suspendTenant(tenant.id).subscribe({
        next: () => {
          this.snackBar.open('Tenant suspended successfully', 'Close', { duration: 3000 });
          this.loadTenants();
        },
        error: (err) => {
          console.error('Error suspending tenant:', err);
          this.snackBar.open('Failed to suspend tenant', 'Close', { duration: 3000 });
        }
      });
    }
  }

  activateTenant(tenant: TenantSummary, event: Event): void {
    event.stopPropagation();

    this.tenantService.activateTenant(tenant.id).subscribe({
      next: () => {
        this.snackBar.open('Tenant activated successfully', 'Close', { duration: 3000 });
        this.loadTenants();
      },
      error: (err) => {
        console.error('Error activating tenant:', err);
        this.snackBar.open('Failed to activate tenant', 'Close', { duration: 3000 });
      }
    });
  }

  refresh(): void {
    this.loadTenants();
  }
}
