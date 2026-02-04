/**
 * OAuth2 Callback Component
 * Handles the OAuth2 redirect and token exchange
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {
  error: string | null = null;
  isProcessing = true;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[CallbackComponent] ngOnInit called at', new Date().toISOString());
    // Get authorization code and state from query params
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      console.log('[CallbackComponent] queryParams subscription fired at', new Date().toISOString());
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];
      const errorDescription = params['error_description'];

      if (error) {
        // Authorization server returned an error
        this.error = errorDescription || error;
        this.isProcessing = false;
        console.error('OAuth2 error:', this.error);
        return;
      }

      if (!code) {
        this.error = 'Authorization code not received';
        this.isProcessing = false;
        console.error('Missing authorization code');
        return;
      }

      // Exchange code for token
      console.log('[CallbackComponent] Calling handleCallback with code:', code);
      this.authService.handleCallback(code, state).subscribe({
        next: (user) => {
          console.log('Authentication successful:', user.email);
          this.isProcessing = false;
          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Authentication failed:', err);
          this.error = err.message || 'Authentication failed';
          this.isProcessing = false;

          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      });
    });
  }

  /**
   * Retry login
   */
  retryLogin(): void {
    this.router.navigate(['/login']);
  }
}
