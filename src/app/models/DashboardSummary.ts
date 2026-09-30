export interface AreaWiseSummary {
  ruralCount: number;
  urbanCount: number;
  unspecifiedCount: number;
  total: number;
  ruralPercentage: number;
  urbanPercentage: number;
}

export interface DistrictWiseApplicant {
  districtCode: string;
  districtName: string;
  districtNameHn: string;
  totalRegistered: number;
  ruralCount: number;
  urbanCount: number;
}

export interface BlockWiseApplicant {
  districtCode: string;
  blockCode: string;
  blockName: string;
  blockNameHn: string;
  totalRegistered: number;
  ruralCount: number;
  urbanCount: number;
}

export interface DemographicItem {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentApplicant {
  userId: number;
  name: string;
  maskedMobile: string;
  districtName: string;
  blockName: string;
  areaType: string;
  entryDate: string | Date | null;
}

export interface DashboardSummaryData {
  totalRegisteredApplicants: number;
  totalBeneficiaries: number;
  totalDistricts: number;
  totalBlocks: number;
  totalPanchayats: number;
  areaWise: AreaWiseSummary;
  districtWise: DistrictWiseApplicant[];
  genderWise: DemographicItem[];
  categoryWise: DemographicItem[];
  recentApplicants: RecentApplicant[];

  // Legacy fields (if encrypted by backend)
  districtCount?: string | number;
  blockCount?: string | number;
  panchayatCount?: string | number;
  awayabCount?: string | number;
  departmentCount?: string | number;
  schemeCount?: string | number;
}

export interface DashboardSummaryResponse {
  status: boolean;
  message: string;
  data: DashboardSummaryData;
}

export interface BlockWiseResponse {
  status: boolean;
  message: string;
  districtCode: string;
  data: BlockWiseApplicant[];
}