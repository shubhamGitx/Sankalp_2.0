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
          this.blocksList = [...res.data].sort((a, b) =>
            a.blockName.localeCompare(b.blockName, undefined, { sensitivity: 'base' })
          );
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

  // ---- Period tabs (visual) ----
  selectedPeriod: string = 'MONTHLY';
  readonly periods: string[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  // ---- Area chart : data-driven smooth wave curves ----
  private readonly PLOT_L = 45;
  private readonly PLOT_R = 685;
  private readonly PLOT_T = 25;
  private readonly PLOT_B = 195;

  get chartDistricts(): DistrictWiseApplicant[] {
    const ds = this.summary?.districtWise ?? [];
    return [...ds].sort((a, b) => b.totalRegistered - a.totalRegistered).slice(0, 6);
  }

  get yAxisTicks(): { val: number; y: number; label: string }[] {
    const ds = this.chartDistricts;
    const max = Math.max(...ds.map(d => d.totalRegistered), 35);
    const steps = [35, 30, 25, 20, 15, 10, 5, 0];
    const factor = max / 35;
    return steps.map(s => {
      const val = Math.round(s * factor);
      const y = Math.round(this.PLOT_B - (s / 35) * (this.PLOT_B - this.PLOT_T));
      const label = String(s).padStart(2, '0');
      return { val, y, label };
    });
  }

  get chartPoints(): { x: number; totalY: number; ruralY: number; label: string }[] {
    const ds = this.chartDistricts;
    if (!ds.length) {
      const sampleLabels = ['Jan', 'Feb', 'Feb', 'Mar', 'Apr', 'May'];
      const sampleTotalY = [190, 140, 160, 90, 130, 195];
      const sampleRuralY = [190, 110, 135, 60, 105, 125];
      const n = sampleLabels.length;
      const step = (this.PLOT_R - this.PLOT_L) / (n - 1);
      return sampleLabels.map((label, i) => ({
        x: Math.round(this.PLOT_L + i * step),
        totalY: sampleTotalY[i],
        ruralY: sampleRuralY[i],
        label
      }));
    }
    const max = Math.max(...ds.map(d => d.totalRegistered), 1);
    const n = ds.length;
    const step = n > 1 ? (this.PLOT_R - this.PLOT_L) / (n - 1) : 0;
    const scale = (v: number) => this.PLOT_B - (v / max) * (this.PLOT_B - this.PLOT_T);
    return ds.map((d, i) => ({
      x: Math.round(this.PLOT_L + i * step),
      totalY: Math.round(scale(d.totalRegistered)),
      ruralY: Math.round(scale(d.ruralCount)),
      label: d.districtName
    }));
  }

  get peakPoint(): { x: number; totalY: number; ruralY: number; label: string } | null {
    const pts = this.chartPoints;
    if (!pts.length) return null;
    let peak = pts[0];
    for (const p of pts) {
      if (p.ruralY < peak.ruralY) {
        peak = p;
      }
    }
    return peak;
  }

  private buildSmoothPath(points: Array<[number, number]>): string {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
    if (points.length === 2) return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;

    let path = `M ${points[0][0]} ${points[0][1]}`;
    const tension = 0.22;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

      const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
      const cp1y = p1[1] + (p2[1] - p0[1]) * tension;

      const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
      const cp2y = p2[1] - (p3[1] - p1[1]) * tension;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0]} ${p2[1]}`;
    }

    return path;
  }

  get totalLinePath(): string {
    return this.buildSmoothPath(this.chartPoints.map(p => [p.x, p.totalY]));
  }

  get totalAreaPath(): string {
    const pts = this.chartPoints;
    if (!pts.length) return '';
    const line = this.totalLinePath;
    return `${line} L ${pts[pts.length - 1].x} ${this.PLOT_B} L ${pts[0].x} ${this.PLOT_B} Z`;
  }

  get ruralLinePath(): string {
    return this.buildSmoothPath(this.chartPoints.map(p => [p.x, p.ruralY]));
  }

  get ruralAreaPath(): string {
    const pts = this.chartPoints;
    if (!pts.length) return '';
    const line = this.ruralLinePath;
    return `${line} L ${pts[pts.length - 1].x} ${this.PLOT_B} L ${pts[0].x} ${this.PLOT_B} Z`;
  }

  // ---- Donut distribution : area-wise rounded arc segments ----
  get donutSegments(): { label: string; pct: number; color: string; dasharray: string; dashoffset: string }[] {
    const aw = this.summary?.areaWise;
    const R = 65;
    const C = 2 * Math.PI * R; // ~408.41
    const gap = 24;

    const ruralPct = aw?.ruralPercentage ?? 65;
    const urbanPct = aw?.urbanPercentage ?? 25;
    const unspecPct = Math.max(0, 100 - ruralPct - urbanPct);

    const raw = [
      { label: 'Rural', pct: ruralPct, color: '#6c5ce7' },
      { label: 'Unspecified', pct: unspecPct > 0 ? unspecPct : 15, color: '#ffca28' },
      { label: 'Urban', pct: urbanPct > 0 ? urbanPct : 20, color: '#ff5252' }
    ].filter(s => s.pct > 0);

    let currentOffset = 0;
    return raw.map(s => {
      const segLen = (s.pct / 100) * C;
      const drawLen = Math.max(2, segLen - gap);
      const dasharray = `${drawLen.toFixed(1)} ${(C - drawLen).toFixed(1)}`;
      const dashoffset = `${(-currentOffset - gap / 2).toFixed(1)}`;
      currentOffset += segLen;
      return { ...s, dasharray, dashoffset };
    });
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

    // Order by District Name
    return [...list].sort((a, b) =>
      a.districtName.localeCompare(b.districtName, undefined, { sensitivity: 'base' })
    );
  }

  get filteredRecentApplicants(): RecentApplicant[] {
    let list: RecentApplicant[];
    if (!this.summary?.recentApplicants) return [];

    if (this.selectedAreaFilter === 'ALL') {
      list = this.summary.recentApplicants;
    } else {
      const targetArea = this.selectedAreaFilter === 'RURAL' ? 'Rural' : 'Urban';
      list = this.summary.recentApplicants.filter(a => a.areaType === targetArea);
    }

    // Order by Applicant Name
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }
}
