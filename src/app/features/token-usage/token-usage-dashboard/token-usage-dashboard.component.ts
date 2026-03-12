import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import {
  TokenUsageService,
  TokenUsageSummary,
  TenantTokenUsage,
  DailyTokenUsage,
  ModelTokenUsage
} from '../services/token-usage.service';

@Component({
  selector: 'app-token-usage-dashboard',
  templateUrl: './token-usage-dashboard.component.html',
  styleUrls: ['./token-usage-dashboard.component.css']
})
export class TokenUsageDashboardComponent implements OnInit {
  summary: TokenUsageSummary | null = null;
  tenantData: TenantTokenUsage[] = [];
  modelData: ModelTokenUsage[] = [];
  loading = true;

  // Date range
  selectedRange = '30';
  startDate: string = '';
  endDate: string = '';

  // Tenant table
  displayedColumns = ['tenant_id', 'total_tokens', 'total_cost_usd', 'request_count'];
  tenantPage = 0;
  tenantPageSize = 10;

  // Daily cost chart
  dailyCostChartData: ChartConfiguration<'line'>['data'] | null = null;
  dailyCostChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Daily Token Cost (USD)' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  constructor(private tokenUsageService: TokenUsageService) {}

  ngOnInit(): void {
    this.setDateRange(30);
    this.loadData();
  }

  setDateRange(days: number): void {
    this.selectedRange = days.toString();
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];
  }

  onRangeChange(): void {
    const days = parseInt(this.selectedRange, 10);
    if (!isNaN(days)) {
      this.setDateRange(days);
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    const opts = { start_date: this.startDate, end_date: this.endDate };

    this.tokenUsageService.getSummary(opts).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.loadMockSummary();
        this.loading = false;
      }
    });

    this.tokenUsageService.getByTenant({ ...opts, page: this.tenantPage, size: this.tenantPageSize }).subscribe({
      next: (data) => { this.tenantData = data.items; },
      error: () => { this.tenantData = []; }
    });

    this.tokenUsageService.getDailyTrend(opts).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.setupDailyChart(data);
        } else {
          this.setupMockDailyChart();
        }
      },
      error: () => { this.setupMockDailyChart(); }
    });

    this.tokenUsageService.getByModel(opts).subscribe({
      next: (data) => { this.modelData = data; },
      error: () => { this.modelData = []; }
    });
  }

  loadMockSummary(): void {
    this.summary = {
      total_prompt_tokens: 1250000,
      total_completion_tokens: 450000,
      total_tokens: 1700000,
      total_cost_usd: 0.46,
      request_count: 3420
    };
  }

  setupDailyChart(data: DailyTokenUsage[]): void {
    this.dailyCostChartData = {
      labels: data.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          data: data.map(d => d.cost_usd),
          label: 'Cost (USD)',
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          data: data.map(d => d.total_tokens / 1000),
          label: 'Tokens (K)',
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    this.dailyCostChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Daily Token Usage & Cost' }
      },
      scales: {
        y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Cost (USD)' } },
        y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'Tokens (K)' }, grid: { drawOnChartArea: false } }
      }
    };
  }

  setupMockDailyChart(): void {
    const mockData = [];
    for (let i = 0; i < 30; i++) {
      mockData.push(0.01 + Math.random() * 0.03);
    }
    this.dailyCostChartData = {
      labels: mockData.map((_, i) => 'Day ' + (i + 1)),
      datasets: [{
        data: mockData,
        label: 'Cost (USD)',
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  get avgCostPerRequest(): number {
    if (!this.summary || !this.summary.request_count) return 0;
    return this.summary.total_cost_usd / this.summary.request_count;
  }
}
