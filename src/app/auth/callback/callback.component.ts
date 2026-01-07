import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {
  processing = true;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];

      if (error) {
        this.handleError(params['error_description'] || 'Authentication failed');
        return;
      }

      if (code) {
        this.exchangeCodeForToken(code);
      } else {
        this.handleError('No authorization code received');
      }
    });
  }

  private exchangeCodeForToken(code: string): void {
    this.authService.exchangeCodeForToken(code).subscribe({
      next: (response) => {
        // Get return URL or default to dashboard
        const returnUrl = this.authService.getReturnUrl() || '/dashboard';
        this.authService.clearReturnUrl();

        // Navigate to the return URL
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        console.error('Token exchange error:', error);
        this.handleError('Failed to complete authentication. Please try again.');
      }
    });
  }

  private handleError(message: string): void {
    this.processing = false;
    this.error = true;
    this.errorMessage = message;

    // Redirect to login after a delay
    setTimeout(() => {
      this.router.navigate(['/login'], {
        queryParams: {
          error: 'oauth_error',
          error_description: message
        }
      });
    }, 3000);
  }
}