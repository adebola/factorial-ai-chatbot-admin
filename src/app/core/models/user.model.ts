/**
 * User Model
 * Represents a user in the ChatCraft system
 */

export interface User {
  user_id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  username?: string;
  roles: string[];
  authorities: string[];
  is_system_admin: boolean;
  is_tenant_admin: boolean;
  token: string;
  refresh_token?: string;
  token_expires_at?: number;
}

/**
 * JWT Token Payload
 */
export interface TokenPayload {
  sub: string;  // user_id
  tenant_id: string;
  email: string;
  full_name: string;
  authorities: string[];
  roles?: string[];
  exp: number;  // Expiration timestamp
  iat: number;  // Issued at timestamp
  iss?: string; // Issuer
  aud?: string; // Audience
}

/**
 * OAuth2 Token Response
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}
