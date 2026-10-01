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
  success?: boolean;
  status?: boolean;
  userExists?: boolean;
  message: string;
  token?: string | null;
  authToken?: string | null;
  data?: BeneficiaryProfile;
}

export interface BeneficiaryInterest {
  mapId: number;
  interestId: number;
  interestName: string;
}

export interface BeneficiaryProfile {
  userId: number;
  name: string;
  mobileNo: string;
  email: string;
  distCode: number;
  blockCode: number;
  panchayatCode: number;
  areaType: string;
  villCode: string;
  wardCode: string;
  genderCode: number;
  ageGroupId: number;
  categoryId: number;
  qualificationId: number;
  occupationId: number;
  deviceId: string;
  token: string;
  entryDate: string;
  interests: number[];
  userInterests: BeneficiaryInterest[];
}

export interface OtpVerificationResult {
  response: OtpResponse;
  mobileNo: string;
  deviceId: string;
}
