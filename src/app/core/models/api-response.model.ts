/**
 * API Response Models
 * Common response structures from backend APIs
 */

/**
 * Generic Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * Generic API Response (Spring Data Page format)
 */
export interface ApiResponse<T> {
  content: T;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Generic API Error Response
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

/**
 * Success Response
 */
export interface SuccessResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * List Response (without pagination)
 */
export interface ListResponse<T> {
  items: T[];
  count: number;
}

/**
 * HTTP Error
 */
export interface HttpError {
  status: number;
  statusText: string;
  message: string;
  error?: any;
}
