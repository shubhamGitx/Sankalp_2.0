export interface SendOtpRequest {
  clientKey: string;
  mobile: string;
  deviceId: string;
}

export interface VerifyOtpRequest {
  mobileNo: string;
  otp: string;
  DeviceId: string;
  clientKey: string;
}

export interface OtpResponse {
  success: boolean;
  userExists?: boolean;
  message: string;
  token?: string | null;
  authToken?: string | null;
  data?: any;
}