export interface InterestItem {
  interest_id: string | number;
  interest_name: string;
  interest_name_hn?: string;
  is_active?: string;
}

export interface InsertInterestWiseMessageRequest {
  interest_id: number;
  message_head?: string;
  message_body: string;
  validity_in_minutes?: number;
  is_active?: string;
  photo1path?: string;
  photo2path?: string;
  videopath?: string;
  documentpath?: string;
  youtubeurl?: string;
  facebookurl?: string;
  instagramurl?: string;
  Xurl?: string;
  entryby?: string;
  client_key?: string;
}

export interface InsertInterestWiseMessageResponse {
  status: boolean;
  message: string;
  msg_id?: number;
  data?: any;
}

export interface GetInterestWiseMessageRequest {
  deviceID: string;
  clientKey: string;
  interest_id: string;
}

export interface GetInterestWiseMessageResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: any;
}

export interface InterestWiseMessageData {
  msg_id: number;
  interest_id: number | null;
  interest_name?: string;
  message_head?: string;
  message_body: string;
  validity_in_minutes: number;
  is_active: string;
  photo1path?: string;
  photo2path?: string;
  videopath?: string;
  documentpath?: string;
  youtubeurl?: string;
  facebookurl?: string;
  instagramurl?: string;
  Xurl?: string;
  entryby: string;
  entrydate?: string;
  is_deleted?: string;
}
