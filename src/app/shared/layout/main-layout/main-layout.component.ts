import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;
  sidenavOpened = true;

  navigationItems: NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Tenants', icon: 'business', route: '/tenants' },
    { label: 'Users', icon: 'people', route: '/users' },
    { label: 'Billing', icon: 'payment', route: '/billing' },
    { label: 'Plans', icon: 'subscriptions', route: '/plans' },
    { label: 'Chat Monitoring', icon: 'chat', route: '/chat-monitoring' },
    { label: 'Quality Analytics', icon: 'analytics', route: '/quality' },
    { label: 'System Analytics', icon: 'insights', route: '/analytics' },
    { label: 'Token Usage', icon: 'toll', route: '/token-usage' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Mark active route
    this.updateActiveRoute();

    // Listen to route changes
    this.router.events.subscribe(() => {
      this.updateActiveRoute();
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout();
  }

  private updateActiveRoute(): void {
    const currentRoute = this.router.url;
    this.navigationItems.forEach(item => {
      item.active = currentRoute.startsWith(item.route);
    });
  }
}
