export interface LoginResponse {
  status: boolean;
  message: string;
  authToken?: string | null;
  clientToken?: string | null;
  ClientToken?: string | null;
  data: {
    userID?: string;
    username?: string;
    userRole?: string;
    mobile?: string;
    
  } | null;
}