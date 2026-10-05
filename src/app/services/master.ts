import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private http = inject(HttpClient);
  private cryptoService = inject(CryptoService);


  private getClientKey(): string {
    const clientAES = localStorage.getItem('clientAES') || '';
    if (!clientAES) {
      throw new Error('Client AES key not found.');
    }
    return this.cryptoService.encryptRSA(clientAES);
  }

  private encryptField(value: string): string {
    const clientAES = localStorage.getItem('clientAES') || '';
    return this.cryptoService.encryptAES(value, clientAES);
  }

  // ----------------------------------------------------------
  // Location Details
  // ----------------------------------------------------------

  getPanchayatList(blockCode: string): Observable<any> {
    return this.http.post<any>('/api/Master/GetPanchayatList', {
      clientKey: this.getClientKey(),
      blockCode: this.encryptField(blockCode),
    });
  }

  getVillageList(panchayatCode: string): Observable<any> {
    return this.http.post<any>('/api/Master/GetVillageList', {
      clientKey: this.getClientKey(),
      panchayatCode: this.encryptField(panchayatCode),
    });
  }

  getWardList(panchayatCode: string): Observable<any> {
    return this.http.post<any>('/api/Master/GetWardList', {
      clientKey: this.getClientKey(),
      panchayatCode: this.encryptField(panchayatCode),
    });
  }

  // ----------------------------------------------------------
  // Demographics
  // ----------------------------------------------------------

  getGenderList(): Observable<any> {
    return this.http.post<any>('/api/Master/GetGenderList', {
      clientKey: this.getClientKey(),
    });
  }

  getAgeGroupList(): Observable<any> {
    return this.http.post<any>('/api/Master/GetAgeGroupList', {
      clientKey: this.getClientKey(),
    });
  }

  getCategoryList(): Observable<any> {
    return this.http.post<any>('/api/Master/GetCategoryList', {
      clientKey: this.getClientKey(),
    });
  }

  getQualificationList(): Observable<any> {
    return this.http.post<any>('/api/Master/GetQualificationList', {
      clientKey: this.getClientKey(),
    });
  }

  getOccupationList(): Observable<any> {
    return this.http.post<any>('/api/Master/GetOccupationList', {
      clientKey: this.getClientKey(),
    });
  }

  getInterestList(): Observable<any> {
    return this.http.post<any>('/api/Master/GetInterestList', {
      clientKey: this.getClientKey(),
    });
  }
}