import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loading = false;
  oauthError = false;
  errorMessage = '';
  isLogout = false;
  autoRedirect = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // If already authenticated, redirect to dashboard or return URL
    if (this.authService.isAuthenticated()) {
      const returnUrl = this.authService.getReturnUrl() || '/dashboard';
      this.authService.clearReturnUrl();
      this.router.navigate([returnUrl]);
    }
  }

  ngOnInit(): void {
    // Check for OAuth2 error parameters
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.oauthError = true;
        this.errorMessage = params['error_description'] || 'Authentication failed';
        this.autoRedirect = false;
        this.loading = false;
        return;
      }

      // Check if this is after an intentional logout
      const intentionalLogout = sessionStorage.getItem('intentional_logout');
      if (intentionalLogout) {
        this.isLogout = true;
        this.autoRedirect = false;
        this.loading = false;
        sessionStorage.removeItem('intentional_logout');
        return;
      }

      // Auto-initiate login if not from logout
      if (!this.isLogout && this.autoRedirect) {
        this.loading = true;
        setTimeout(() => this.initiateLogin(), 1000);
      }
    });
  }

  initiateLogin(): void {
    this.loading = true;
    this.authService.login();
  }

  retryLogin(): void {
    this.oauthError = false;
    this.errorMessage = '';
    this.initiateLogin();
  }
}