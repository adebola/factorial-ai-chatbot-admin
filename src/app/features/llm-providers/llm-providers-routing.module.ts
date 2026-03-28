import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProviderListComponent } from './provider-list/provider-list.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: ProviderListComponent }
  ])],
  exports: [RouterModule]
})
export class LLMProvidersRoutingModule { }
