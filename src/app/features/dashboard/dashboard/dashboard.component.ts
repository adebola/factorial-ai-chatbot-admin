import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import {
  DashboardService,
  DashboardMetrics,
  GrowthData,
  RecentActivity,
  QuickStats
} from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  quickStats: QuickStats | null = null;
  recentActivity: RecentActivity[] = [];
  loading = true;
  error: string | null = null;

  // Chart data
  growthChartData: ChartConfiguration<'line'>['data'] | null = null;
  growthChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Platform Growth (Last 30 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  revenueChartData: ChartConfiguration<'bar'>['data'] | null = null;
  revenueChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Revenue Trend (Last 30 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load metrics
    this.dashboardService.getDashboardMetrics().subscribe({
      next: (metrics: DashboardMetrics | null) => {
        this.metrics = metrics;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard metrics:', err);
        this.error = 'Failed to load dashboard metrics. Using mock data.';
        this.loadMockData();
        this.loading = false;
      }
    });

    // Load quick stats
    this.dashboardService.getQuickStats().subscribe({
      next: (stats: QuickStats | null) => {
        this.quickStats = stats;
      },
      error: (err) => {
        console.error('Error loading quick stats:', err);
      }
    });

    // Load growth data for charts
    this.dashboardService.getGrowthData(30).subscribe({
      next: (response) => {
        console.log('Growth data API response:', response);

        let growthData: GrowthData | null = null;

        // Handle multiple possible response formats
        if (response && this.isValidGrowthData(response)) {
          // Direct format: { labels: [...], tenant_growth: [...], ... }
          growthData = response as GrowthData;
        } else if (response && (response as any).growth && this.isValidGrowthData((response as any).growth)) {
          // Wrapped in 'growth' key
          growthData = (response as any).growth;
        } else if (response && Array.isArray((response as any).data)) {
          // Backend format: { period: {...}, data: [{ date, messages, sessions, activeTenants }] }
          console.log('Transforming backend data format to chart format');
          growthData = this.transformBackendGrowthData((response as any).data);
        }

        if (growthData && this.isValidGrowthData(growthData)) {
          console.log('Valid growth data received, setting up charts');
          this.setupCharts(growthData);
        } else {
          console.warn('Invalid growth data format, using mock data');
          this.setupMockCharts();
        }
      },
      error: (err) => {
        console.error('Error loading growth data:', err);
        this.setupMockCharts();
      }
    });

    // Load recent activity
    this.dashboardService.getRecentActivity(10).subscribe({
      next: (activity) => {
        this.recentActivity = activity;
      },
      error: (err) => {
        console.error('Error loading recent activity:', err);
      }
    });
  }

  setupCharts(growthData: GrowthData): void {
    // Validate data before setting up charts
    if (!growthData || !this.isValidGrowthData(growthData)) {
      console.warn('Invalid growth data in setupCharts, using mock');
      this.setupMockCharts();
      return;
    }

    console.log('Setting up charts with data:', {
      labelCount: growthData.labels?.length,
      tenantGrowthCount: growthData.tenant_growth?.length,
      chatVolumeCount: growthData.chat_volume?.length,
      revenueGrowthCount: growthData.revenue_growth?.length
    });

    // Setup line chart for tenant growth and chat volume
    this.growthChartData = {
      labels: growthData.labels || [],
      datasets: [
        {
          data: growthData.tenant_growth || [],
          label: 'Tenants',
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          data: growthData.chat_volume || [],
          label: 'Chat Volume',
          borderColor: '#ff4081',
          backgroundColor: 'rgba(255, 64, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Setup bar chart for revenue
    this.revenueChartData = {
      labels: growthData.labels || [],
      datasets: [
        {
          data: growthData.revenue_growth || [],
          label: 'Revenue ($)',
          backgroundColor: '#7c4dff',
          borderColor: '#7c4dff',
          borderWidth: 1
        }
      ]
    };
  }

  setupMockCharts(): void {
    const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const mockTenantGrowth = Array.from({ length: 30 }, (_, i) => 10 + i * 2);
    const mockChatVolume = Array.from({ length: 30 }, (_, i) => 50 + Math.random() * 100);
    const mockRevenue = Array.from({ length: 30 }, (_, i) => 1000 + Math.random() * 500);

    this.setupCharts({
      labels,
      tenant_growth: mockTenantGrowth,
      chat_volume: mockChatVolume,
      revenue_growth: mockRevenue
    });
  }

  isValidGrowthData(data: any): boolean {
    return data &&
           Array.isArray(data.labels) &&
           data.labels.length > 0 &&
           Array.isArray(data.tenant_growth) &&
           data.tenant_growth.length > 0 &&
           Array.isArray(data.chat_volume) &&
           data.chat_volume.length > 0 &&
           Array.isArray(data.revenue_growth) &&
           data.revenue_growth.length > 0;
  }

  transformBackendGrowthData(data: any[]): GrowthData | null {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('Cannot transform empty or invalid data array');
      return null;
    }

    console.log('Transforming', data.length, 'data points from backend format');

    // Create a map of dates to data for quick lookup
    const dataMap = new Map();
    data.forEach(item => {
      dataMap.set(item.date, item);
    });

    // Generate all dates for the last 30 days
    const labels: string[] = [];
    const tenant_growth: number[] = [];
    const chat_volume: number[] = [];
    const revenue_growth: number[] = [];

    // const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // 30 days total including today

    // Fill in all 30 days
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateStr = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Check if we have data for this date
      const dayData = dataMap.get(dateStr);

      labels.push(label);
      tenant_growth.push(dayData ? (dayData.activeTenants || 0) : 0);
      chat_volume.push(dayData ? (dayData.messages || 0) : 0);
      revenue_growth.push(dayData ? ((dayData.messages || 0) * 10) : 0);
    }

    console.log('Filled in all 30 days. Days with data:', dataMap.size, 'Total days:', labels.length);

    return {
      labels,
      tenant_growth,
      chat_volume,
      revenue_growth
    };
  }

  loadMockData(): void {
    this.metrics = {
      total_tenants: 45,
      active_tenants: 42,
      suspended_tenants: 3,
      total_users: 1250,
      active_users: 1180,
      total_chats: 15420,
      total_messages: 234560,
      total_revenue: 125000,
      monthly_revenue: 15600
    };

    this.quickStats = {
      new_tenants_today: 2,
      new_users_today: 15,
      revenue_today: 850,
      chats_today: 342
    };

    this.setupMockCharts();
  }

  navigateToTenants(): void {
    this.router.navigate(['/tenants']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

  navigateToBilling(): void {
    this.router.navigate(['/billing']);
  }

  refresh(): void {
    this.loadDashboardData();
  }

  getActivityColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'tenant': 'primary',
      'payment': 'accent',
      'user': 'primary',
      'chat': 'warn'
    };
    return colorMap[type] || 'primary';
  }
}
