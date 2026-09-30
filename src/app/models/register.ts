export interface UserRegisterRequest {
  name: string;
  mobileNo: string;
  password: string;
  email: string;
  interests: number[];
  distCode: number;
  blockCode: number;
  panchayatCode: number;
  areaType: string;
  villCode: number;
  wardCode: string;
  genderCode: number;
  ageGroupId: number;
  categoryId: number;
  qualificationId: number;
  occupationId: number;
  deviceId: string;
  entryBy: string;
}

export interface RegisterResponse {
  status?: boolean;
  success?: boolean;
  message: string;
  token?: string | null;
  authToken?: string | null;
  data?: any;
}