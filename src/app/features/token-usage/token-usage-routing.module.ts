import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TokenUsageDashboardComponent } from './token-usage-dashboard/token-usage-dashboard.component';

const routes: Routes = [
  { path: '', component: TokenUsageDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TokenUsageRoutingModule {}
