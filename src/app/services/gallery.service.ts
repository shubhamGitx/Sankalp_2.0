import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  private http = inject(HttpClient);

  private apiUrl = '/api/Gallery';


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