import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class PortalService {

  private http = inject(HttpClient);
  private cryptoService = inject(CryptoService);

  apiUrl = '/api/Master/GetPortalList';
  portalApiUrl = '/api/Portal';
  applicantApiUrl = '/api/Applicant';

  getPortalList(): Observable<any> {

    const clientAES = localStorage.getItem('clientAES') || '';

    if (!clientAES) {
      throw new Error('Client AES key not found.');
    }

    const clientKey = this.cryptoService.encryptRSA(clientAES);

    // Send RSA encrypted AES key
    const request = {
      clientKey: clientKey
    };

    return this.http.post<any>(this.apiUrl, request);
  }

  
  getUserType(portalId: number | string): Observable<any> {

    const request = {
      portal_id: Number(portalId)
    };

    return this.http.post<any>(`${this.portalApiUrl}/GetUserType`, request);
  }

 
  sendPortalOtp(payload: any): Observable<any> {
    return this.http.post<any>(`${this.applicantApiUrl}/GetApplicantDetails`, payload);
  }

}
