import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboardservice';
import {
  DashboardSummaryData,
  DistrictWiseApplicant,
  BlockWiseApplicant,
  RecentApplicant
} from '../../models/DashboardSummary';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  summary: DashboardSummaryData | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  // Filter & Search states
  districtSearch: string = '';
  selectedAreaFilter: 'ALL' | 'RURAL' | 'URBAN' = 'ALL';

  // District-to-Block Drilldown state
  selectedDistrict: DistrictWiseApplicant | null = null;
  blocksList: BlockWiseApplicant[] = [];
  blocksLoading: boolean = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.status && res.data) {
          this.summary = res.data;

          // Auto-select first district with registrations if available
          if (this.summary.districtWise && this.summary.districtWise.length > 0) {
            const activeDist = this.summary.districtWise.find(d => d.totalRegistered > 0) || this.summary.districtWise[0];
            this.selectDistrict(activeDist);
          }
        } else {
          this.errorMessage = res?.message || 'Unable to load dashboard data.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load dashboard:', err);
        this.errorMessage = 'Unable to connect to SankalpAPI dashboard service.';
        this.cdr.detectChanges();
      }
    });
  }

  selectDistrict(district: DistrictWiseApplicant): void {
    this.selectedDistrict = district;
    this.blocksLoading = true;
    this.blocksList = [];

    this.dashboardService.getBlockWise(district.districtCode).subscribe({
      next: (res) => {
        this.blocksLoading = false;
        if (res && res.status && res.data) {
          this.blocksList = res.data;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.blocksLoading = false;
        console.error('Failed to load block data:', err);
        this.cdr.detectChanges();
      }
    });
  }

  setAreaFilter(filter: 'ALL' | 'RURAL' | 'URBAN'): void {
    this.selectedAreaFilter = filter;
  }

  get filteredDistricts(): DistrictWiseApplicant[] {
    if (!this.summary?.districtWise) return [];
    let list = this.summary.districtWise;

    if (this.districtSearch.trim()) {
      const q = this.districtSearch.trim().toLowerCase();
      list = list.filter(d =>
        d.districtName.toLowerCase().includes(q) ||
        (d.districtNameHn && d.districtNameHn.toLowerCase().includes(q)) ||
        d.districtCode.includes(q)
      );
    }

    if (this.selectedAreaFilter === 'RURAL') {
      list = list.filter(d => d.ruralCount > 0);
    } else if (this.selectedAreaFilter === 'URBAN') {
      list = list.filter(d => d.urbanCount > 0);
    }

    return list;
  }

  get filteredRecentApplicants(): RecentApplicant[] {
    if (!this.summary?.recentApplicants) return [];
    if (this.selectedAreaFilter === 'ALL') {
      return this.summary.recentApplicants;
    }
    const targetArea = this.selectedAreaFilter === 'RURAL' ? 'Rural' : 'Urban';
    return this.summary.recentApplicants.filter(a => a.areaType === targetArea);
  }
}