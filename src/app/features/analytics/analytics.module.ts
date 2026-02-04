import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AnalyticsDashboardComponent
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    NgChartsModule
  ]
})
export class AnalyticsModule {}
