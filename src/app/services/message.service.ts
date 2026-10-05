import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InsertBroadcastMessageRequest,
  InsertBroadcastMessageResponse
} from '../models/broadcast-message';
import {
  InsertInterestWiseMessageRequest,
  InsertInterestWiseMessageResponse,
  GetInterestWiseMessageRequest,
  GetInterestWiseMessageResponse
} from '../models/interest-message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = '/api/Message';
  private masterApiUrl = '/api/Master';

  /**
   * Calls SankalpAPI InsertBroadcastMessage endpoint to insert a broadcast record into SQL Server (tbl_BroadCastMessage).
   * @param request The broadcast message payload
   * @returns Observable of InsertBroadcastMessageResponse containing status, message, and generated bmsg_id
   */
  insertBroadcastMessage(request: InsertBroadcastMessageRequest): Observable<InsertBroadcastMessageResponse> {
    return this.http.post<InsertBroadcastMessageResponse>(
      `${this.apiUrl}/InsertBroadcastMessage`,
      request
    );
  }

  /**
   * Retrieves all active broadcast messages from SQL Server (tbl_BroadCastMessage).
   */
  getBroadcastMessages(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetBroadCastMessage`, {});
  }

  /**
   * Inserts an interest-wise targeted message into SQL Server (tbl_Message).
   * @param request Payload with interest_id, message_head, message_body, media links, etc.
   */
  insertInterestWiseMessage(request: InsertInterestWiseMessageRequest): Observable<InsertInterestWiseMessageResponse> {
    return this.http.post<InsertInterestWiseMessageResponse>(
      `${this.apiUrl}/InsertInterestWiseMessage`,
      request
    );
  }

  /**
   * Retrieves interest-wise messages from SQL Server (tbl_Message).
   * @param interestId Optional interest_id to filter messages by category
   */
  getInterestWiseMessages(interestId?: number): Observable<any> {
    const url = interestId ? `${this.apiUrl}/GetInterestWiseMessages?interestId=${interestId}` : `${this.apiUrl}/GetInterestWiseMessages`;
    return this.http.get<any>(url);
  }

  /**
   * Retrieves the interest-wise message for a given user's selected interest.
   * @param request Payload with deviceID, clientKey and interest_id
   */
  getInterestWiseMessage(request: GetInterestWiseMessageRequest): Observable<GetInterestWiseMessageResponse> {
    return this.http.post<GetInterestWiseMessageResponse>(
      `${this.apiUrl}/GetInterestWiseMessage`,
      request
    );
  }

  /**
   * Retrieves the master list of departments/interests from mst_interest.
   */
  getInterestList(): Observable<any> {
    return this.http.post<any>(`${this.masterApiUrl}/GetInterestList`, {});
  }
}
