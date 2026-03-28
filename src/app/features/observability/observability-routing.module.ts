import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackendListComponent } from './backend-list/backend-list.component';

const routes: Routes = [
  {
    path: '',
    component: BackendListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ObservabilityRoutingModule {}
