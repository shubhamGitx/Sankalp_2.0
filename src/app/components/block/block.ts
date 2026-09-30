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

    const distCode = event.target.value;

    if (distCode === '') {

      this.blocks = [];

      return;

    }

    this.loadBlocks(distCode);

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

}