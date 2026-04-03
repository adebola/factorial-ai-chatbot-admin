import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { AgentSessionsComponent } from './agent-sessions/agent-sessions.component';

const routes: Routes = [
  {
    path: '',
    component: ServiceListComponent
  },
  {
    path: 'sessions',
    component: AgentSessionsComponent
  },
  {
    path: ':id',
    component: ServiceDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgenticServicesRoutingModule {}
