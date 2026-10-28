import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/Gallery`;


  // ============================================
  // GET GALLERY
  // ============================================

  getGallery(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/List`
    );

  }


  // ============================================
  // UPLOAD GALLERY
  // ============================================

  uploadGallery(request: any): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/Upload`,
      request
    );

  }

}
