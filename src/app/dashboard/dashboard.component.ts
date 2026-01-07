import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = {
    totalTenants: 0,
    totalUsers: 0,
    totalMessages: 0,
    activeSubscriptions: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load actual dashboard data from API
    // For now, using dummy data
    this.stats = {
      totalTenants: 42,
      totalUsers: 1250,
      totalMessages: 15678,
      activeSubscriptions: 38
    };
  }

  logout(): void {
    this.authService.logout(true);
  }
}