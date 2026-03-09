import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService, Payment } from '../services/billing.service';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.css']
})
export class PaymentDetailComponent implements OnInit {
  payment: Payment | null = null;
  loading = true;
  error: string | null = null;
  paymentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.paymentId) {
      this.loadPayment();
    }
  }

  loadPayment(): void {
    this.loading = true;
    this.billingService.getPaymentById(this.paymentId).subscribe({
      next: (payment) => {
        console.log('Payment detail API response:', payment);
        this.payment = payment;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payment:', err);
        this.error = 'Failed to load payment details';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/billing']);
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'completed': 'completed-chip',
      'pending': 'pending-chip',
      'failed': 'failed-chip',
      'refunded': 'refunded-chip'
    };
    return colors[status] || '';
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = currency === 'NGN' ? '₦' : currency;
    return symbol + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}
