import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import {
  AnalyticsService,
  SystemMetrics,
  EngagementMetrics,
  GrowthMetrics,
  SystemHealth,
  RevenueDataPoint,
  UserGrowthDataPoint,
  PerformanceMetric
} from '../services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  systemMetrics: SystemMetrics | null = null;
  engagementMetrics: EngagementMetrics | null = null;
  growthMetrics: GrowthMetrics | null = null;
  systemHealth: SystemHealth | null = null;
  loading = true;

  revenueChartData: ChartConfiguration<'line'>['data'] | null = null;
  revenueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Revenue Trend (Last 30 Days)' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  userGrowthChartData: ChartConfiguration<'line'>['data'] | null = null;
  userGrowthChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'User Growth (Last 30 Days)' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  performanceChartData: ChartConfiguration<'line'>['data'] | null = null;
  performanceChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'System Performance (Last 24 Hours)' }
    },
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.loading = true;

    this.analyticsService.getSystemMetrics().subscribe({
      next: (metrics) => {
        this.systemMetrics = metrics;
        this.loading = false;
      },
      error: () => {
        this.loadMockSystemMetrics();
        this.loading = false;
      }
    });

    this.analyticsService.getEngagementMetrics().subscribe({
      next: (metrics) => {
        this.engagementMetrics = metrics;
      },
      error: () => {
        this.loadMockEngagementMetrics();
      }
    });

    this.analyticsService.getGrowthMetrics().subscribe({
      next: (metrics) => {
        this.growthMetrics = metrics;
      },
      error: () => {
        this.loadMockGrowthMetrics();
      }
    });

    this.analyticsService.getSystemHealth().subscribe({
      next: (health) => {
        this.systemHealth = health;
      },
      error: () => {
        this.loadMockSystemHealth();
      }
    });

    this.analyticsService.getRevenueTrend(30).subscribe({
      next: (response) => {
        console.log('Revenue trend API response:', response);

        let data: RevenueDataPoint[] | null = null;

        // Handle multiple possible response formats
        if (Array.isArray(response)) {
          // Direct array format
          data = response;
        } else if (response && (response as any).data && Array.isArray((response as any).data)) {
          // Wrapped in 'data' key
          data = (response as any).data;
        } else if (response && (response as any).revenue && Array.isArray((response as any).revenue)) {
          // Wrapped in 'revenue' key
          data = (response as any).revenue;
        }

        if (data && data.length > 0) {
          console.log('Valid revenue data received, setting up chart');
          this.setupRevenueChart(data);
        } else {
          console.warn('Invalid or empty revenue data, using mock');
          this.setupMockRevenueChart();
        }
      },
      error: (err) => {
        console.error('Error loading revenue trend:', err);
        this.setupMockRevenueChart();
      }
    });

    this.analyticsService.getUserGrowthTrend(30).subscribe({
      next: (response) => {
        console.log('User growth trend API response:', response);

        let data: UserGrowthDataPoint[] | null = null;

        // Handle multiple possible response formats
        if (Array.isArray(response)) {
          // Direct array format
          data = response;
        } else if (response && (response as any).data && Array.isArray((response as any).data)) {
          // Wrapped in 'data' key
          data = (response as any).data;
        } else if (response && (response as any).users && Array.isArray((response as any).users)) {
          // Wrapped in 'users' key
          data = (response as any).users;
        }

        if (data && data.length > 0) {
          console.log('Valid user growth data received, setting up chart');
          this.setupUserGrowthChart(data);
        } else {
          console.warn('Invalid or empty user growth data, using mock');
          this.setupMockUserGrowthChart();
        }
      },
      error: (err) => {
        console.error('Error loading user growth trend:', err);
        this.setupMockUserGrowthChart();
      }
    });

    this.analyticsService.getPerformanceMetrics(24).subscribe({
      next: (response) => {
        console.log('Performance metrics API response:', response);

        let data: PerformanceMetric[] | null = null;

        // Handle multiple possible response formats
        if (Array.isArray(response)) {
          // Direct array format
          data = response;
        } else if (response && (response as any).data && Array.isArray((response as any).data)) {
          // Wrapped in 'data' key
          data = (response as any).data;
        } else if (response && (response as any).metrics && Array.isArray((response as any).metrics)) {
          // Wrapped in 'metrics' key
          data = (response as any).metrics;
        }

        if (data && data.length > 0) {
          console.log('Valid performance data received, setting up chart');
          this.setupPerformanceChart(data);
        } else {
          console.warn('Invalid or empty performance data, using mock');
          this.setupMockPerformanceChart();
        }
      },
      error: (err) => {
        console.error('Error loading performance metrics:', err);
        this.setupMockPerformanceChart();
      }
    });
  }

  loadMockSystemMetrics(): void {
    this.systemMetrics = {
      total_revenue: 245000,
      mrr: 28500,
      arr: 342000,
      active_subscriptions: 42,
      churn_rate: 2.3,
      average_revenue_per_tenant: 5833
    };
  }

  loadMockEngagementMetrics(): void {
    this.engagementMetrics = {
      daily_active_users: 850,
      weekly_active_users: 1125,
      monthly_active_users: 1250,
      average_session_duration: 18.5,
      messages_per_user: 47.2,
      active_conversations: 3420
    };
  }

  loadMockGrowthMetrics(): void {
    this.growthMetrics = {
      new_tenants_this_month: 8,
      new_users_this_month: 156,
      growth_rate: 12.5,
      conversion_rate: 34.2,
      retention_rate: 94.7
    };
  }

  loadMockSystemHealth(): void {
    this.systemHealth = {
      api_uptime: 99.98,
      average_response_time: 145,
      error_rate: 0.02,
      database_health: 'Healthy',
      cache_hit_rate: 94.5,
      queue_status: 'Normal'
    };
  }

  setupRevenueChart(data: RevenueDataPoint[]): void {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('Invalid revenue data in setupRevenueChart, using mock');
      this.setupMockRevenueChart();
      return;
    }

    console.log('Setting up revenue chart with', data.length, 'data points');

    this.revenueChartData = {
      labels: data.map(d => d?.date ? new Date(d.date).toLocaleDateString() : 'N/A'),
      datasets: [{
        data: data.map(d => d?.revenue || 0),
        label: 'Revenue',
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  setupMockRevenueChart(): void {
    const mockData = [];
    for (let i = 0; i < 30; i++) {
      mockData.push(7000 + Math.random() * 3000);
    }

    this.revenueChartData = {
      labels: mockData.map((_, i) => 'Day ' + (i + 1)),
      datasets: [{
        data: mockData,
        label: 'Revenue',
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  setupUserGrowthChart(data: UserGrowthDataPoint[]): void {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('Invalid user growth data in setupUserGrowthChart, using mock');
      this.setupMockUserGrowthChart();
      return;
    }

    console.log('Setting up user growth chart with', data.length, 'data points');

    this.userGrowthChartData = {
      labels: data.map(d => d?.date ? new Date(d.date).toLocaleDateString() : 'N/A'),
      datasets: [
        {
          data: data.map(d => d?.new_users || 0),
          label: 'New Users',
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          data: data.map(d => d?.total_users || 0),
          label: 'Total Users',
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  setupMockUserGrowthChart(): void {
    const mockData = [];
    let total = 1100;
    for (let i = 0; i < 30; i++) {
      const newUsers = Math.floor(3 + Math.random() * 8);
      total += newUsers;
      mockData.push({ new: newUsers, total });
    }

    this.userGrowthChartData = {
      labels: mockData.map((_, i) => 'Day ' + (i + 1)),
      datasets: [
        {
          data: mockData.map(d => d.new),
          label: 'New Users',
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          data: mockData.map(d => d.total),
          label: 'Total Users',
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  setupPerformanceChart(data: PerformanceMetric[]): void {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('Invalid performance data in setupPerformanceChart, using mock');
      this.setupMockPerformanceChart();
      return;
    }

    console.log('Setting up performance chart with', data.length, 'data points');

    this.performanceChartData = {
      labels: data.map(d => d?.timestamp ? new Date(d.timestamp).toLocaleTimeString() : 'N/A'),
      datasets: [
        {
          data: data.map(d => d?.cpu_usage || 0),
          label: 'CPU Usage (%)',
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: false,
          tension: 0.4
        },
        {
          data: data.map(d => d?.memory_usage || 0),
          label: 'Memory Usage (%)',
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          fill: false,
          tension: 0.4
        }
      ]
    };
  }

  setupMockPerformanceChart(): void {
    const mockData = [];
    for (let i = 0; i < 24; i++) {
      mockData.push({
        cpu: 25 + Math.random() * 30,
        memory: 40 + Math.random() * 20
      });
    }

    this.performanceChartData = {
      labels: mockData.map((_, i) => i + ':00'),
      datasets: [
        {
          data: mockData.map(d => d.cpu),
          label: 'CPU Usage (%)',
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: false,
          tension: 0.4
        },
        {
          data: mockData.map(d => d.memory),
          label: 'Memory Usage (%)',
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          fill: false,
          tension: 0.4
        }
      ]
    };
  }

  getHealthColor(status: string): string {
    return status === 'Healthy' ? 'success' : status === 'Degraded' ? 'warn' : 'error';
  }

  getQueueColor(status: string): string {
    return status === 'Normal' ? 'success' : status === 'Busy' ? 'warn' : 'error';
  }
}
