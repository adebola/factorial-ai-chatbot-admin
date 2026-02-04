import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { QualityService, QualityMetrics, TenantQuality, QualityTrend, KnowledgeGap } from '../services/quality.service';

@Component({
  selector: 'app-quality-dashboard',
  templateUrl: './quality-dashboard.component.html',
  styleUrls: ['./quality-dashboard.component.css']
})
export class QualityDashboardComponent implements OnInit {
  metrics: QualityMetrics | null = null;
  tenantQuality: TenantQuality[] = [];
  knowledgeGaps: KnowledgeGap[] = [];
  loading = true;

  displayedColumns = ['tenant_name', 'average_score', 'conversation_count', 'quality_distribution', 'knowledge_gaps', 'trend'];

  trendChartData: ChartConfiguration<'line'>['data'] | null = null;
  trendChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Quality Trend (Last 30 Days)' }
    },
    scales: {
      y: { beginAtZero: true, max: 5 }
    }
  };

  constructor(
    private qualityService: QualityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQualityData();
  }

  loadQualityData(): void {
    this.loading = true;

    this.qualityService.getPlatformQualityMetrics().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;
      },
      error: () => {
        this.loadMockMetrics();
        this.loading = false;
      }
    });

    this.qualityService.getTenantQualityList().subscribe({
      next: (tenants) => {
        this.tenantQuality = tenants;
      },
      error: () => {
        this.loadMockTenants();
      }
    });

    this.qualityService.getQualityTrends(30).subscribe({
      next: (trends) => {
        this.setupTrendChart(trends);
      },
      error: () => {
        this.setupMockTrendChart();
      }
    });

    this.qualityService.getKnowledgeGaps().subscribe({
      next: (gaps) => {
        this.knowledgeGaps = gaps.slice(0, 5);
      },
      error: () => {
        this.loadMockKnowledgeGaps();
      }
    });
  }

  loadMockMetrics(): void {
    this.metrics = {
      platform_average_score: 4.3,
      total_conversations: 15420,
      high_quality_count: 12000,
      low_quality_count: 850,
      knowledge_gaps_count: 45,
      trending_up: true
    };
  }

  loadMockTenants(): void {
    this.tenantQuality = [
      {
        tenant_id: '1',
        tenant_name: 'Acme Corporation',
        average_score: 4.5,
        conversation_count: 3500,
        high_quality_percentage: 85,
        low_quality_percentage: 5,
        knowledge_gaps: 8,
        trend: 'up'
      },
      {
        tenant_id: '2',
        tenant_name: 'Tech Innovations',
        average_score: 4.2,
        conversation_count: 2800,
        high_quality_percentage: 78,
        low_quality_percentage: 8,
        knowledge_gaps: 12,
        trend: 'stable'
      }
    ];
  }

  loadMockKnowledgeGaps(): void {
    this.knowledgeGaps = [
      {
        id: '1',
        tenant_id: '1',
        tenant_name: 'Acme Corporation',
        topic: 'API Authentication',
        frequency: 25,
        example_question: 'How do I authenticate API requests?',
        identified_at: '2024-03-20T10:00:00Z'
      }
    ];
  }

  setupTrendChart(trends: QualityTrend[]): void {
    this.trendChartData = {
      labels: trends.map(t => new Date(t.date).toLocaleDateString()),
      datasets: [{
        data: trends.map(t => t.average_score),
        label: 'Quality Score',
        borderColor: '#7c4dff',
        backgroundColor: 'rgba(124, 77, 255, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  setupMockTrendChart(): void {
    const mockData = [];
    for (let idx = 0; idx < 30; idx++) {
      mockData.push(4.0 + Math.random() * 0.8);
    }
    
    this.trendChartData = {
      labels: mockData.map((_, idx) => 'Day ' + (idx + 1)),
      datasets: [{
        data: mockData,
        label: 'Quality Score',
        borderColor: '#7c4dff',
        backgroundColor: 'rgba(124, 77, 255, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  viewTenantDetail(tenant: TenantQuality): void {
    this.router.navigate(['/quality/tenant', tenant.tenant_id]);
  }

  getTrendIcon(trend: string): string {
    const icons: any = { 'up': 'trending_up', 'down': 'trending_down', 'stable': 'trending_flat' };
    return icons[trend] || 'trending_flat';
  }

  getTrendColor(trend: string): string {
    const colors: any = { 'up': 'success', 'down': 'warn', 'stable': 'neutral' };
    return colors[trend] || 'neutral';
  }
}
