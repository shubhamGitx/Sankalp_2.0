import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  UserRegisterRequest,
  RegisterResponse,
} from '../models/register';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

  private http = inject(HttpClient);

  private apiUrl = '/api/Auth/Register';

  register(request: UserRegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.apiUrl, request);
  }

}