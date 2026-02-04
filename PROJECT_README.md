# ChatCraft Super Admin Application

Angular-based super admin application for managing the entire ChatCraft multi-tenant platform.

## Overview

This application provides Factorial Systems staff with cross-tenant administrative capabilities including:

- **Tenant Management**: View, edit, suspend/activate all tenants
- **User Administration**: Cross-tenant user search, role assignment (ROLE_SYSTEM_ADMIN)
- **Billing Management**: View subscriptions, payments, create manual payments
- **Plan Management**: Create, update, delete subscription plans
- **Chat Monitoring**: View chat sessions and messages across all tenants
- **Quality Analytics**: Platform-wide quality metrics and tenant-specific drilldown
- **System Analytics**: Platform metrics, revenue analytics, growth trends

## Requirements

- **Authentication**: OAuth2 with ROLE_SYSTEM_ADMIN authority
- **OAuth2 Client**: `superadmin-client`
- **Port**: 4201 (to avoid conflict with tenant admin on 4200)

## Technology Stack

- **Framework**: Angular 15
- **UI Components**: Angular Material (Indigo/Pink theme)
- **Charts**: Chart.js with ng2-charts
- **Authentication**: OAuth2 Authorization Code flow with PKCE
- **HTTP Client**: Angular HttpClient with interceptors

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── services/            # Auth, HTTP services
│   │   ├── guards/              # Route guards (system-admin.guard.ts)
│   │   ├── interceptors/        # HTTP interceptors (auth, error)
│   │   └── models/              # TypeScript interfaces
│   ├── features/                # Feature modules
│   │   ├── auth/                # Login, callback
│   │   ├── dashboard/           # System overview dashboard
│   │   ├── tenants/             # Tenant management
│   │   ├── users/               # User management
│   │   ├── billing/             # Billing and payments
│   │   ├── plans/               # Plan CRUD
│   │   ├── chat-monitoring/     # Chat session monitoring
│   │   ├── quality/             # Quality analytics
│   │   └── analytics/           # Platform analytics
│   └── shared/                  # Shared components, directives, pipes
└── environments/                # Environment configurations
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
ng serve
# Runs on http://localhost:4201
```

### Build for Production

```bash
ng build --configuration production
```

## Configuration

### Environment Variables

See `src/environments/environment.ts` for configuration:

- `apiUrl`: Backend API gateway URL
- `authServiceUrl`: Authorization server URL
- `oauth2`: OAuth2 client configuration

### OAuth2 Configuration

- **Client ID**: `superadmin-client`
- **Client Secret**: `superadmin-secret` (for backend token exchange)
- **Redirect URI**: `http://localhost:4201/callback` (dev) / `https://admin.chatcraft.cc/callback` (prod)
- **Required Scope**: `openid profile read write admin system-admin`
- **Required Authority**: `ROLE_SYSTEM_ADMIN`

## Security

### Access Control

- All routes protected by `systemAdminGuard`
- Guard checks for `ROLE_SYSTEM_ADMIN` in JWT token authorities
- Token stored securely in sessionStorage (cleared on logout)
- Auto-logout on token expiration

### PKCE Flow

- Uses Proof Key for Code Exchange for enhanced security
- Code verifier generated client-side
- Code challenge sent to authorization server

## Features

### Dashboard

- Platform-wide metrics cards (tenants, users, revenue, chats)
- Growth charts (tenant growth, revenue trends, chat volume)
- Quick actions (create payment, add tenant, view users)

### Tenant Management

- Paginated tenant list with search/filter
- Tenant detail view with tabs (Overview, Users, Subscription, Statistics)
- Suspend/Activate tenant actions
- Edit tenant configuration

### User Management

- Cross-tenant user search
- Filter by tenant, role, status
- Assign/Remove ROLE_SYSTEM_ADMIN
- Admin password reset
- User suspend/activate

### Billing Management

- View all subscriptions across tenants
- View all payments with filters
- Create manual payments with subscription extension
- Subscription override capabilities

### Quality Monitoring

- Platform-wide quality metrics
- Tenant-specific quality drilldown
- Knowledge gap detection
- Low-quality message identification

## Testing

### Unit Tests

```bash
ng test
```

### E2E Tests

```bash
ng e2e
```

## Deployment

### Docker Build

```bash
docker build -t chatcraft-superadmin:latest .
```

### Environment-Specific Builds

```bash
# Production
ng build --configuration production

# Staging
ng build --configuration staging
```

## Notes

- This application is for **internal use only** by Factorial Systems staff
- Requires ROLE_SYSTEM_ADMIN authority - regular tenant admins cannot access
- All admin actions are logged for audit purposes
- Cross-tenant data access is logged for compliance

## Support

For issues or questions, contact the Factorial Systems development team.
