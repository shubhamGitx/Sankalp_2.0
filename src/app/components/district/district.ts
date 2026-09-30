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

  ngOnInit(): void {

    this.loadDistricts();

  }

  loadDistricts() {

    this.districtService.getDistrictList().subscribe({

      next: (res: any) => {

        console.log(res);

        if (res.status) {

          //this.districts = res.data;

          const clientAES = localStorage.getItem('clientAES') || '';
          this.districts = res.data.map((item: any) => ({
          distCode: this.cryptoService.decryptAES(item.district_Code, clientAES),
          distName: this.cryptoService.decryptAES(item.district_Name, clientAES),
          distNameHN: this.cryptoService.decryptAES(item.district_Name_Hn, clientAES)
}));
//this.districts.sort((a, b) => a.distName.localeCompare(b.distName));
console.log(this.districts);
this.cdr.detectChanges();

        }

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

}