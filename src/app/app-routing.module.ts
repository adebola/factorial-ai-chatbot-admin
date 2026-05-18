import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './features/auth/login/login.component';
import { CallbackComponent } from './features/auth/callback/callback.component';
import { AccessDeniedComponent } from './features/auth/access-denied/access-denied.component';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { SystemAdminGuard } from './core/guards/system-admin.guard';
import { PluginAvailabilityGuard } from './core/guards/plugin-availability.guard';

const routes: Routes = [
  // Public routes (no authentication required)
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },

  // Protected routes (require authentication and ROLE_SYSTEM_ADMIN)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [SystemAdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'tenants',
        loadChildren: () => import('./features/tenants/tenants.module').then(m => m.TenantsModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'billing',
        loadChildren: () => import('./features/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'plans',
        loadChildren: () => import('./features/plans/plans.module').then(m => m.PlansModule)
      },
      {
        path: 'chat-monitoring',
        loadChildren: () => import('./features/chat-monitoring/chat-monitoring.module').then(m => m.ChatMonitoringModule)
      },
      {
        path: 'quality',
        loadChildren: () => import('./features/quality/quality.module').then(m => m.QualityModule)
      },
      {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
      },
      {
        path: 'token-usage',
        loadChildren: () => import('./features/token-usage/token-usage.module').then(m => m.TokenUsageModule)
      },
      {
        path: 'services',
        loadChildren: () => import('./features/agentic-services/agentic-services.module').then(m => m.AgenticServicesModule)
      },
      {
        // Plugin route — gated by PluginAvailabilityGuard so a bookmarked URL
        // cannot reach the lazy-loaded module when the observability plugin is
        // not installed in this environment. The `pluginRoute` data key is the
        // identifier the catalog matches against (see PluginCatalogService).
        path: 'observability',
        canActivate: [PluginAvailabilityGuard],
        data: { pluginRoute: 'observability' },
        loadChildren: () => import('./features/observability/observability.module').then(m => m.ObservabilityModule)
      },
      {
        // Plugin route — same gating as `observability` above. The LLM
        // Providers menu is contributed by the observability plugin's
        // manifest, so its `pluginRoute` resolves through the same catalog.
        path: 'llm-providers',
        canActivate: [PluginAvailabilityGuard],
        data: { pluginRoute: 'llm-providers' },
        loadChildren: () => import('./features/llm-providers/llm-providers.module').then(m => m.LLMProvidersModule)
      },
      {
        path: 'audit-logs',
        loadChildren: () => import('./features/audit-logs/audit-logs.module').then(m => m.AuditLogsModule)
      },
      {
        path: 'rag-inspector',
        loadChildren: () => import('./features/rag-inspector/rag-inspector.module').then(m => m.RagInspectorModule)
      }
    ]
  },

  // Wildcard route - redirect to dashboard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
