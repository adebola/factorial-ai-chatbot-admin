/**
 * Login Component
 * Handles OAuth2 login for ChatCraft Super Admin
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated() && this.authService.isSystemAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Initiate OAuth2 login
   */
  login(): void {
    this.isLoading = true;
    this.authService.login();
  }
}
