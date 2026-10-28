import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CaptchaResponse {
  captchaId: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/Captcha`;

  getCaptcha(): Observable<CaptchaResponse> {

    return this.http.get<CaptchaResponse>(this.apiUrl);

  }

}
