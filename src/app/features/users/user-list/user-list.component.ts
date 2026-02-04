import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UserService, UserListParams, UserSummary, Role } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['full_name', 'email', 'roles', 'status', 'last_login_at', 'actions'];
  dataSource: UserSummary[] = [];

  loading = false;
  error: string | null = null;

  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  // Filters
  searchControl = new FormControl('');
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  roleFilter = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    const params: UserListParams = {
      page: this.pageIndex,
      size: this.pageSize,
      search: this.searchControl.value || undefined,
      status: this.statusFilter,
      role: this.roleFilter || undefined
    };

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        console.log('Users API response:', response);
        const sampleUser = response && (response as any).content ? (response as any).content[0] : null;
        console.log('Sample user (first user):', sampleUser);

        if (sampleUser) {
          console.log('User active status fields:', {
            is_active: sampleUser.is_active,
            isActive: sampleUser.isActive,
            enabled: sampleUser.enabled,
            active: sampleUser.active
          });
          console.log('User roles:', sampleUser.roles);
          console.log('User last login fields:', {
            last_login_at: sampleUser.last_login_at,
            lastLoginAt: sampleUser.lastLoginAt
          });
        }

        // Handle different response formats
        if (Array.isArray(response)) {
          this.dataSource = response;
          this.totalElements = response.length;
        } else if (response && (response as any).users) {
          this.dataSource = (response as any).users;
          this.totalElements = (response as any).total || (response as any).users.length;
        } else if (response && response.content) {
          this.dataSource = response.content || [];
          this.totalElements = response.totalElements || 0;
        } else if (response && (response as any).data) {
          this.dataSource = (response as any).data;
          this.totalElements = (response as any).total || (response as any).data.length;
        } else {
          this.dataSource = [];
          this.totalElements = 0;
        }

        console.log('Processed dataSource (first user):', this.dataSource[0]);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users. Using mock data.';
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.dataSource = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        tenant_name: 'Acme Corporation',
        username: 'john.doe',
        email: 'john.doe@acme.com',
        full_name: 'John Doe',
        is_active: true,
        is_system_admin: false,
        is_tenant_admin: true,
        created_at: '2024-01-15T10:00:00Z',
        last_login_at: '2024-03-20T14:30:00Z'
      },
      {
        id: '2',
        tenant_id: 'tenant-2',
        tenant_name: 'Tech Innovations',
        username: 'jane.smith',
        email: 'jane.smith@techinnovations.com',
        full_name: 'Jane Smith',
        is_active: true,
        is_system_admin: true,
        is_tenant_admin: false,
        created_at: '2024-02-10T09:15:00Z',
        last_login_at: '2024-03-19T11:20:00Z'
      },
      {
        id: '3',
        tenant_id: 'tenant-3',
        tenant_name: 'Global Solutions',
        username: 'bob.johnson',
        email: 'bob.johnson@globalsolutions.com',
        full_name: 'Bob Johnson',
        is_active: false,
        is_system_admin: false,
        is_tenant_admin: false,
        created_at: '2024-01-05T08:00:00Z',
        last_login_at: null
      }
    ];
    this.totalElements = 3;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadUsers();
  }

  viewUser(user: UserSummary): void {
    this.router.navigate(['/users', user.id]);
  }

  suspendUser(user: UserSummary, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to suspend user "${user.full_name}"?`)) {
      this.userService.suspendUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User suspended successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error suspending user:', err);
          this.snackBar.open('Failed to suspend user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  activateUser(user: UserSummary, event: Event): void {
    event.stopPropagation();

    this.userService.activateUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('User activated successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error activating user:', err);
        this.snackBar.open('Failed to activate user', 'Close', { duration: 3000 });
      }
    });
  }

  assignSystemAdmin(user: UserSummary, event: Event): void {
    event.stopPropagation();

    if (confirm(`Assign ROLE_SYSTEM_ADMIN to "${user.full_name}"?`)) {
      this.userService.assignSystemAdminRole(user.id).subscribe({
        next: () => {
          this.snackBar.open('System admin role assigned', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error assigning role:', err);
          this.snackBar.open('Failed to assign role', 'Close', { duration: 3000 });
        }
      });
    }
  }

  removeSystemAdmin(user: UserSummary, event: Event): void {
    event.stopPropagation();

    if (confirm(`Remove ROLE_SYSTEM_ADMIN from "${user.full_name}"?`)) {
      this.userService.removeSystemAdminRole(user.id).subscribe({
        next: () => {
          this.snackBar.open('System admin role removed', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error removing role:', err);
          this.snackBar.open('Failed to remove role', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resetPassword(user: UserSummary, event: Event): void {
    event.stopPropagation();

    if (confirm(`Reset password for "${user.full_name}"?`)) {
      this.userService.resetPassword(user.id).subscribe({
        next: (response) => {
          this.snackBar.open(
            `Password reset. Temporary password: ${response.temporaryPassword}`,
            'Close',
            { duration: 10000 }
          );
        },
        error: (err) => {
          console.error('Error resetting password:', err);
          this.snackBar.open('Failed to reset password', 'Close', { duration: 3000 });
        }
      });
    }
  }

  refresh(): void {
    this.loadUsers();
  }

  getRoleBadges(user: UserSummary): string[] {
    const badges: string[] = [];

    // First, try to use the roles array if available
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Map backend role names to display names
      user.roles.forEach(role => {
        // Handle both string and Role object types
        const roleName = typeof role === 'string' ? role : (role as Role).name;
        const displayName = this.formatRoleName(roleName);
        if (displayName && !badges.includes(displayName)) {
          badges.push(displayName);
        }
      });
    }

    // Fallback to boolean flags if no roles array
    if (badges.length === 0) {
      if (user.is_system_admin) badges.push('System Admin');
      if (user.is_tenant_admin) badges.push('Tenant Admin');
    }

    // Default to 'User' if no roles found
    return badges.length > 0 ? badges : ['User'];
  }

  formatRoleName(role: string): string {
    // Remove ROLE_ prefix and format nicely
    const name = role.replace(/^ROLE_/, '');

    // Convert SYSTEM_ADMIN to System Admin, TENANT_ADMIN to Tenant Admin, etc.
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getLastLoginDisplay(user: UserSummary): string {
    // Check for last_login_at (snake_case) or lastLoginAt (camelCase)
    const lastLogin = user.last_login_at || (user as any).lastLoginAt;

    if (!lastLogin) {
      return 'Never';
    }

    // Check if it's a valid date string
    const date = new Date(lastLogin);
    if (isNaN(date.getTime())) {
      return 'Never';
    }

    // Format the date
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  isUserActive(user: UserSummary): boolean {
    // Check multiple possible field names for active status
    if (user.is_active !== undefined) return user.is_active;
    if ((user as any).isActive !== undefined) return (user as any).isActive;
    if ((user as any).enabled !== undefined) return (user as any).enabled;
    if ((user as any).active !== undefined) return (user as any).active;

    // Default to false if not found
    return false;
  }

  isSystemAdmin(user: UserSummary): boolean {
    // Check boolean flag first
    if (user.is_system_admin) return true;

    // Check roles array for ROLE_SYSTEM_ADMIN or SYSTEM_ADMIN
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      const firstRole = user.roles[0];

      // Handle Role objects (new structure)
      if (typeof firstRole === 'object' && firstRole !== null && 'name' in firstRole) {
        return (user.roles as Role[]).some(role =>
          role.name === 'SYSTEM_ADMIN' || role.name === 'ROLE_SYSTEM_ADMIN'
        );
      }

      // Handle string array (old structure)
      if (typeof firstRole === 'string') {
        return (user.roles as string[]).includes('ROLE_SYSTEM_ADMIN') ||
               (user.roles as string[]).includes('SYSTEM_ADMIN');
      }
    }

    return false;
  }
}
