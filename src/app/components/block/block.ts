import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistrictService } from '../../services/district';
import { BlockService } from '../../services/block';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block.html',
  styleUrl: './block.css'
})
export class BlockComponent implements OnInit {

  private districtService = inject(DistrictService);
  private blockService = inject(BlockService);
  private cryptoService = inject(CryptoService);
  private cdr = inject(ChangeDetectorRef);

  districts: any[] = [];
  blocks: any[] = [];
  selectedDistCode = '';
  searchTerm = '';

  get filteredBlocks(): any[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.blocks;
    return this.blocks.filter(b =>
      (b.blockCode || '').toLowerCase().includes(q) ||
      (b.blockName || '').toLowerCase().includes(q) ||
      (b.blockNameHN || '').toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {

    this.loadDistricts();

  }

  loadDistricts() {

  const clientAES = localStorage.getItem('clientAES') || '';

  this.districtService.getDistrictList().subscribe({
    next: (res: any) => {

      console.log('1. API returned');

      if (res.status) {

        console.log('2. Before map');

        this.districts = res.data.map((item: any) => ({
          distCode: this.cryptoService.decryptAES(item.district_Code, clientAES),
          distName: this.cryptoService.decryptAES(item.district_Name, clientAES),
          distNameHN: this.cryptoService.decryptAES(item.district_Name_HN, clientAES)
        }));

        console.log('3. After map');
        console.log(this.districts);
        this.cdr.detectChanges();

      }
    },
    error: err => console.error(err)
  });
}

  onDistrictChange(event: any) {

    this.selectedDistCode = event.target.value;

    if (this.selectedDistCode === '') {

      this.blocks = [];
      this.searchTerm = '';
      this.cdr.detectChanges();

      return;

    }

    this.searchTerm = '';
    this.loadBlocks(this.selectedDistCode);

  }

  loadBlocks(distCode: string) {

    const clientAES = localStorage.getItem('clientAES') || '';

    this.blockService.getBlockList(distCode).subscribe({

      next: (res: any) => {

        console.log('API response data:', res.data);

        if (res.status && Array.isArray(res.data)) {

          this.blocks = res.data.map((item: any) => ({

            blockCode: this.cryptoService.decryptAES(item.blockCode || item.BlockCode || '', clientAES),

            blockName: this.cryptoService.decryptAES(item.blockName || item.BlockName || '', clientAES),

            blockNameHN: this.cryptoService.decryptAES(item.blockNameHN || item.BlockNameHN || item.blockNameHn || '', clientAES)

          }));

          this.cdr.detectChanges();

        } else {
          this.blocks = [];
          this.cdr.detectChanges();
        }

      },
      error: (err) => {
        console.error('Error loading blocks:', err);
        this.blocks = [];
        this.cdr.detectChanges();
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

  onRefresh(): void {
    this.searchTerm = '';
    if (this.selectedDistCode) {
      this.loadBlocks(this.selectedDistCode);
    } else {
      this.blocks = [];
    }
    this.cdr.detectChanges();
  }

  onExport(): void {
    const rows = this.filteredBlocks;
    if (!rows.length) return;

    const header = ['Block Code', 'Block Name', 'Hindi Name'];
    const lines = rows.map(b =>
      [this.escapeCsv(b.blockCode), this.escapeCsv(b.blockName), this.escapeCsv(b.blockNameHN)].join(',')
    );
    const csv = '\uFEFF' + header.join(',') + '\r\n' + lines.join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'block-master.csv';
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
    if (!name) return 'BL';
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