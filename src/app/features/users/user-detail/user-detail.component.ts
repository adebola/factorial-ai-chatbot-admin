import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService, UserDetail, Role } from '../services/user.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: UserDetail | null = null;
  loading = true;
  error: string | null = null;
  userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUser();
    }
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (response: any) => {
        console.log('User API response:', response);
        this.user = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user details';
        this.loading = false;
      }
    });
  }

  /**
   * Check if user is active
   */
  isUserActive(): boolean {
    return this.user?.isActive || this.user?.is_active || false;
  }

  /**
   * Check if user has TENANT_ADMIN role
   */
  isTenantAdmin(): boolean {
    if (!this.user) return false;

    // Check if roles is an array of objects with 'name' property
    if (Array.isArray(this.user.roles) && this.user.roles.length > 0) {
      const firstRole = this.user.roles[0];

      // Check if roles are objects (new structure)
      if (typeof firstRole === 'object' && firstRole !== null && 'name' in firstRole) {
        return (this.user.roles as Role[]).some(role => role.name === 'TENANT_ADMIN');
      }
      // Check if roles are strings (old structure)
      if (typeof firstRole === 'string') {
        return (this.user.roles as string[]).includes('TENANT_ADMIN') ||
               (this.user.roles as string[]).includes('ROLE_TENANT_ADMIN');
      }
    }

    // Fallback to is_tenant_admin property
    return this.user.is_tenant_admin || false;
  }

  /**
   * Check if user has SYSTEM_ADMIN role
   */
  isSystemAdmin(): boolean {
    if (!this.user) return false;

    // Check if roles is an array of objects with 'name' property
    if (Array.isArray(this.user.roles) && this.user.roles.length > 0) {
      const firstRole = this.user.roles[0];

      // Check if roles are objects (new structure)
      if (typeof firstRole === 'object' && firstRole !== null && 'name' in firstRole) {
        return (this.user.roles as Role[]).some(role => role.name === 'SYSTEM_ADMIN');
      }
      // Check if roles are strings (old structure)
      if (typeof firstRole === 'string') {
        return (this.user.roles as string[]).includes('SYSTEM_ADMIN') ||
               (this.user.roles as string[]).includes('ROLE_SYSTEM_ADMIN');
      }
    }

    // Fallback to is_system_admin property
    return this.user.is_system_admin || false;
  }

  /**
   * Get tenant name
   */
  getTenantName(): string {
    if (!this.user) return 'N/A';

    // Check nested tenant object first (new structure)
    if (this.user.tenant && this.user.tenant.name) {
      return this.user.tenant.name;
    }

    // Fallback to flat tenant_name property
    return this.user.tenant_name || 'N/A';
  }

  /**
   * Get last login date
   */
  getLastLogin(): string | null {
    return this.user?.lastLoginAt || this.user?.last_login_at || null;
  }

  /**
   * Get created date
   */
  getCreatedAt(): string {
    return this.user?.createdAt || this.user?.created_at || '';
  }

  /**
   * Get full name
   */
  getFullName(): string {
    if (!this.user) return 'N/A';

    // Try full_name first
    if (this.user.full_name) {
      return this.user.full_name;
    }

    // Build from firstName and lastName
    if (this.user.firstName || this.user.lastName) {
      return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
    }

    return this.user.username || this.user.email || 'N/A';
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  suspendUser(): void {
    if (!this.user) return;

    if (confirm(`Suspend user "${this.getFullName()}"?`)) {
      this.userService.suspendUser(this.userId).subscribe({
        next: () => {
          this.snackBar.open('User suspended', 'Close', { duration: 3000 });
          this.loadUser();
        },
        error: () => {
          this.snackBar.open('Failed to suspend user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  activateUser(): void {
    this.userService.activateUser(this.userId).subscribe({
      next: () => {
        this.snackBar.open('User activated', 'Close', { duration: 3000 });
        this.loadUser();
      },
      error: () => {
        this.snackBar.open('Failed to activate user', 'Close', { duration: 3000 });
      }
    });
  }

  resetPassword(): void {
    if (confirm('Reset password for this user?')) {
      this.userService.resetPassword(this.userId).subscribe({
        next: (response) => {
          this.snackBar.open(
            `Password reset. Temporary: ${response.temporaryPassword}`,
            'Close',
            { duration: 10000 }
          );
        },
        error: () => {
          this.snackBar.open('Failed to reset password', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
