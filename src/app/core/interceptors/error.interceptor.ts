/**
 * Error Interceptor
 * Handles HTTP errors globally and provides user-friendly error messages
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiError } from '../models/api-response.model';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('[ErrorInterceptor] Intercepting request:', request.method, request.url);
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.error && typeof error.error === 'object') {
            const apiError = error.error as ApiError;
            errorMessage = apiError.message || apiError.error || errorMessage;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else {
            errorMessage = this.getErrorMessage(error.status);
          }
        }

        // Log error to console (in development)
        console.error('HTTP Error:', {
          status: error.status,
          statusText: error.statusText,
          message: errorMessage,
          url: error.url,
          error: error.error
        });

        // Return user-friendly error
        return throwError(() => ({
          status: error.status,
          statusText: error.statusText,
          message: errorMessage,
          error: error.error
        }));
      })
    );
  }

  /**
   * Get user-friendly error message based on status code
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The server took too long to respond.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
