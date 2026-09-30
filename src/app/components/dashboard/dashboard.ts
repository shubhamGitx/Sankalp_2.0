import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboardservice';
import { CryptoService } from '../../services/crypto.service';

interface ActivityItem {
  date: string;
  time: string;
  user: string;
  action: string;
  subtext: string;
  badgeColor: 'pink' | 'purple' | 'cyan' | 'orange' | 'green';
  status: string;
  statusClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private dashboardService = inject(DashboardService);
  private cryptoService = inject(CryptoService);
  private cdr = inject(ChangeDetectorRef);

  dashboard: any = {
    DistrictCount: 0,
    BlockCount: 0,
    PanchayatCount: 0,
    AwayabCount: 0,
    DepartmentCount: 0,
    SchemeCount: 0
  };

  selectedPeriod: string = 'MONTHLY';
  readonly periods: string[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

  recentActivities: ActivityItem[] = [
    {
      date: '03-Aug-2026',
      time: '4:29 Mins Ago',
      user: 'Admin',
      action: 'Logged In',
      subtext: 'Admin: Logged into dashboard',
      badgeColor: 'pink',
      status: 'Active',
      statusClass: 'badge-pink'
    },
    {
      date: '03-Aug-2026',
      time: '1 hr Ago',
      user: 'District User',
      action: 'Added District',
      subtext: 'District User: Created District Record',
      badgeColor: 'purple',
      status: 'Open',
      statusClass: 'badge-purple'
    },
    {
      date: '03-Aug-2026',
      time: '2 hrs Ago',
      user: 'Block User',
      action: 'Updated Block',
      subtext: 'Block User: Updated Block Details',
      badgeColor: 'cyan',
      status: 'Updated',
      statusClass: 'badge-cyan'
    },
    {
      date: '02-Aug-2026',
      time: '1 day Ago',
      user: 'Panchayat User',
      action: 'Verified Panchayat',
      subtext: 'Panchayat User: Synchronized data',
      badgeColor: 'orange',
      status: 'Pending',
      statusClass: 'badge-orange'
    },
    {
      date: '01-Aug-2026',
      time: '3 days Ago',
      user: 'Admin',
      action: 'Scheme Verified',
      subtext: 'Admin: Approved Scheme Data',
      badgeColor: 'green',
      status: 'Closed',
      statusClass: 'badge-green'
    }
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  get totalUnits(): number {
    return (
      (this.dashboard?.DistrictCount || 0) +
      (this.dashboard?.BlockCount || 0) +
      (this.dashboard?.PanchayatCount || 0) +
      (this.dashboard?.AwayabCount || 0) +
      (this.dashboard?.DepartmentCount || 0) +
      (this.dashboard?.SchemeCount || 0)
    );
  }

  loadDashboard(): void {
    const clientAES = localStorage.getItem('clientAES') || '';

    this.dashboardService.getSummary().subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.dashboard = {
            DistrictCount: Number(this.cryptoService.decryptAES(res.data.districtCount, clientAES)) || 0,
            BlockCount: Number(this.cryptoService.decryptAES(res.data.blockCount, clientAES)) || 0,
            PanchayatCount: Number(this.cryptoService.decryptAES(res.data.panchayatCount, clientAES)) || 0,
            AwayabCount: Number(this.cryptoService.decryptAES(res.data.awayabCount, clientAES)) || 0,
            DepartmentCount: Number(this.cryptoService.decryptAES(res.data.departmentCount, clientAES)) || 0,
            SchemeCount: Number(this.cryptoService.decryptAES(res.data.schemeCount, clientAES)) || 0
          };
          console.log(this.dashboard);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard summary', err);
      }
    });
  }
}