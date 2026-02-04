/**
 * Access Denied Component
 * Shown when user is authenticated but lacks ROLE_SYSTEM_ADMIN
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent implements OnInit {
  userEmail: string = '';
  userAuthorities: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userEmail = user.email;
      this.userAuthorities = user.authorities || [];
    }
  }

  /**
   * Logout and return to login page
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
