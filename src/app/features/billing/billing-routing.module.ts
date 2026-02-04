import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';

const routes: Routes = [
  {
    path: '',
    component: BillingComponent
  },
  {
    path: 'payments/:id',
    component: PaymentDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
