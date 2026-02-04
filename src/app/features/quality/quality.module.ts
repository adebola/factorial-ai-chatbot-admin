import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QualityRoutingModule } from './quality-routing.module';
import { QualityComponent } from './quality/quality.component';
import { QualityDashboardComponent } from './quality-dashboard/quality-dashboard.component';
import { TenantQualityDetailComponent } from './tenant-quality-detail/tenant-quality-detail.component';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Charts
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    QualityComponent,
    QualityDashboardComponent,
    TenantQualityDetailComponent
  ],
  imports: [
    CommonModule,
    QualityRoutingModule,
    // Material modules
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgChartsModule
  ]
})
export class QualityModule { }
