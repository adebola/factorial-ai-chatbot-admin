import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tenant-quality-detail',
  templateUrl: './tenant-quality-detail.component.html',
  styleUrls: ['./tenant-quality-detail.component.css']
})
export class TenantQualityDetailComponent {
  tenantId: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {
    this.tenantId = this.route.snapshot.paramMap.get('id') || '';
  }

  goBack(): void {
    this.router.navigate(['/quality']);
  }
}
