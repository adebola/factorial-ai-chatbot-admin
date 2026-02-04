import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QualityDashboardComponent } from './quality-dashboard/quality-dashboard.component';
import { TenantQualityDetailComponent } from './tenant-quality-detail/tenant-quality-detail.component';

const routes: Routes = [
  {
    path: '',
    component: QualityDashboardComponent
  },
  {
    path: 'tenant/:id',
    component: TenantQualityDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QualityRoutingModule { }
