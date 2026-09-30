import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  SendOtpRequest,
  VerifyOtpRequest,
  OtpResponse,
} from '../models/otp';

@Injectable({
  providedIn: 'root',
})
export class OtpService {

  private http = inject(HttpClient);

  sendOtp(request: SendOtpRequest): Observable<OtpResponse> {
    return this.http.post<OtpResponse>('/api/Otp/SendOtp', request);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<OtpResponse> {
    return this.http.post<OtpResponse>('/api/Otp/VerifyOtp', request);
  }

}