import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistrictService } from '../../services/district';
import { District } from '../../models/district';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-district',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './district.html',
  styleUrl: './district.css'
})
export class DistrictComponent implements OnInit {

  private cryptoService = inject(CryptoService);
  private districtService = inject(DistrictService);
  private cdr = inject(ChangeDetectorRef);

  districts: District[] = [];
  searchTerm = '';

  get filteredDistricts(): District[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.districts;
    return this.districts.filter(d =>
      (d.distCode || '').toLowerCase().includes(q) ||
      (d.distName || '').toLowerCase().includes(q) ||
      (d.distNameHN || '').toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    this.loadDistricts();
  }

  loadDistricts() {
    this.districtService.getDistrictList().subscribe({
      next: (res: any) => {
        if (res.status) {
          const clientAES = localStorage.getItem('clientAES') || '';
          this.districts = res.data.map((item: any) => ({
            distCode: this.cryptoService.decryptAES(item.district_Code, clientAES),
            distName: this.cryptoService.decryptAES(item.district_Name, clientAES),
            distNameHN: this.cryptoService.decryptAES(item.district_Name_Hn, clientAES)
          }));

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load districts:', err);
      }
    });
  }

  // Search helpers
  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value || '';
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.cdr.detectChanges();
  }

  // Reload the district list and reset the search
  onRefresh(): void {
    this.searchTerm = '';
    this.loadDistricts();
  }

  onExport(): void {
    const rows = this.filteredDistricts;
    if (!rows.length) return;

    const header = ['District Code', 'District Name', 'Hindi Name'];
    const lines = rows.map(r =>
      [this.escapeCsv(r.distCode), this.escapeCsv(r.distName), this.escapeCsv(r.distNameHN)].join(',')
    );
    const csv = '\uFEFF' + header.join(',') + '\r\n' + lines.join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'district-master.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private escapeCsv(value: string): string {
    const v = (value ?? '').toString();
    return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }

  getInitials(name: string): string {
    if (!name) return 'DS';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#e0e7ff', '#fce7f3', '#fef3c7', '#dcfce7', '#e0f2fe', '#f3e8ff', '#fee2e2'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getAvatarTextColor(name: string): string {
    const textColors = [
      '#4338ca', '#be185d', '#b45309', '#15803d', '#0369a1', '#7e22ce', '#b91c1c'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return textColors[Math.abs(hash) % textColors.length];
  }
}