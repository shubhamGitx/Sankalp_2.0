import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BeneficiaryProfile } from '../../models/otp';
import { MasterService } from '../../services/master';
import { DistrictService } from '../../services/district';
import { BlockService } from '../../services/block';
import { CryptoService } from '../../services/crypto.service';
import { MessageService } from '../../services/message.service';
import { BroadcastMessageData } from '../../models/broadcast-message';

@Component({
  selector: 'app-beneficiary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './beneficiary-dashboard.html',
  styleUrl: './beneficiary-dashboard.css'
})
export class BeneficiaryComponent implements OnInit {

  profile: BeneficiaryProfile | null = null;

  collapsed = false;

  selectedMenu: string = 'dashboard';

  broadcastList: BroadcastMessageData[] = [];

  broadcastLoading = false;

  genders: { code: string; name: string }[] = [];
  ageGroups: { code: string; name: string }[] = [];
  categories: { code: string; name: string }[] = [];
  qualifications: { code: string; name: string }[] = [];
  occupations: { code: string; name: string }[] = [];
  districts: { code: string; name: string }[] = [];
  blocks: { code: string; name: string }[] = [];

  constructor(
    private router: Router,
    private masterService: MasterService,
    private districtService: DistrictService,
    private blockService: BlockService,
    private cryptoService: CryptoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const savedProfile = localStorage.getItem('beneficiaryProfile');
    if (!savedProfile) {
      return;
    }

    try {
      this.profile = JSON.parse(savedProfile) as BeneficiaryProfile;
      this.loadMasterData();
    } catch {
      localStorage.removeItem('beneficiaryProfile');
    }
  }

  private loadMasterData(): void {
    if (!localStorage.getItem('clientAES')) {
      return;
    }

    this.masterService.getGenderList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.genders = this.mapList(res.data,
            ['gender_code', 'gender_Code', 'genderCode', 'GenderCode'],
            ['gender_name', 'gender_Name', 'genderName', 'GenderName']);
        }
      },
      error: (err) => console.error('Failed to load genders', err),
    });

    this.masterService.getAgeGroupList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.ageGroups = this.mapList(res.data,
            ['id', 'age_group_id', 'ageGroupId', 'age_Group_Id'],
            ['age_group_name', 'ageGroupName', 'ageGroup_Name']);
        }
      },
      error: (err) => console.error('Failed to load age groups', err),
    });

    this.masterService.getCategoryList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.categories = this.mapList(res.data,
            ['category_id', 'category_Id', 'categoryId', 'CategoryID'],
            ['category_name', 'category_Name', 'categoryName', 'category']);
        }
      },
      error: (err) => console.error('Failed to load categories', err),
    });

    this.masterService.getQualificationList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.qualifications = this.mapList(res.data,
            ['qualification_id', 'qualification_Id', 'qualificationId', 'QualificationID'],
            ['qualification_name', 'qualification_Name', 'qualificationName']);
        }
      },
      error: (err) => console.error('Failed to load qualifications', err),
    });

    this.masterService.getOccupationList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.occupations = this.mapList(res.data,
            ['occupation_id', 'occupation_Id', 'occupationId', 'OccupationID'],
            ['occupation_name', 'occupation_Name', 'occupationName']);
        }
      },
      error: (err) => console.error('Failed to load occupations', err),
    });

    this.districtService.getDistrictList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.districts = this.mapList(res.data,
            ['district_code', 'District_Code', 'district_Code', 'districtcode', 'distCode', 'districtCode'],
            ['district_name', 'District_Name', 'district_Name', 'districtname', 'distName', 'districtName']);
        }
      },
      error: (err) => console.error('Failed to load districts', err),
    });

    if (this.profile?.distCode) {
      this.blockService.getBlockList(String(this.profile.distCode)).subscribe({
        next: (res: any) => {
          if (res?.status && Array.isArray(res.data)) {
            this.blocks = this.mapList(res.data,
              ['blockcode', 'BlockCode', 'blockCode', 'block_Code'],
              ['blockname', 'BlockName', 'blockName', 'block_Name']);
          }
        },
        error: (err) => console.error('Failed to load blocks', err),
      });
    }
  }

  private mapList(data: any[], codeKeys: string[], nameKeys: string[]): { code: string; name: string }[] {
    return data.map((item: any) => ({
      code: this.decrypt(this.firstValue(item, codeKeys)),
      name: this.decrypt(this.firstValue(item, nameKeys)),
    }));
  }

  private firstValue(obj: any, keys: string[]): string {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== '') {
        return v;
      }
    }
    return '';
  }

  private decrypt(value: string): string {
    if (!value) return '';
    const clientAES = localStorage.getItem('clientAES') || '';
    try {
      const decrypted = this.cryptoService.decryptAES(String(value), clientAES);
      return decrypted || String(value);
    } catch {
      return String(value);
    }
  }

  /** Falls back to the raw code when no friendly name is available. */
  private resolve(list: { code: string; name: string }[], code: number | string | null | undefined): string {
    if (code === undefined || code === null || code === '') {
      return '—';
    }
    const found = list.find((i) => String(i.code) === String(code));
    return found ? found.name : String(code);
  }

  get displayName(): string {
    return this.profile?.name || 'Beneficiary';
  }

  get displayEmail(): string {
    return this.profile?.email || 'beneficiary@sankalpsetu.gov.in';
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

 
  selectMenu(menu: string): void {
    this.selectedMenu = menu;
    if (menu === 'broadcast') {
      this.loadBroadcastMessages();
    }
  }

 
  loadBroadcastMessages(): void {
    this.broadcastLoading = true;
    this.messageService.getBroadcastMessages().subscribe({
      next: (res: any) => {
        this.broadcastLoading = false;
        if (res && res.status && Array.isArray(res.data)) {
          this.broadcastList = res.data;
        } else {
          this.broadcastList = [];
        }
      },
      error: (err) => {
        this.broadcastLoading = false;
        console.error('Failed to load broadcast messages', err);
      },
    });
  }


  onMenuClick(): void {
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }


  get genderLabel(): string {
    return this.resolve(this.genders, this.profile?.genderCode);
  }

  get ageGroupLabel(): string {
    return this.resolve(this.ageGroups, this.profile?.ageGroupId);
  }

  get categoryLabel(): string {
    return this.resolve(this.categories, this.profile?.categoryId);
  }

  get qualificationLabel(): string {
    return this.resolve(this.qualifications, this.profile?.qualificationId);
  }

  get occupationLabel(): string {
    return this.resolve(this.occupations, this.profile?.occupationId);
  }

  get districtLabel(): string {
    return this.resolve(this.districts, this.profile?.distCode);
  }

  get blockLabel(): string {
    return this.resolve(this.blocks, this.profile?.blockCode);
  }

  get areaTypeLabel(): string {
    const t = this.profile?.areaType || '';
    if (t === 'R' || t === 'Rural' || t === 'rural') return 'Rural';
    if (t === 'U' || t === 'Urban' || t === 'urban') return 'Urban';
    return t || '—';
  }

}
