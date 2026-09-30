import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CaptchaResponse {
  captchaId: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {

  private http = inject(HttpClient);

  private apiUrl = 'http://10.133.20.147:81/api/Captcha';

  getCaptcha(): Observable<CaptchaResponse> {

    return this.http.get<CaptchaResponse>(this.apiUrl);

  }

}