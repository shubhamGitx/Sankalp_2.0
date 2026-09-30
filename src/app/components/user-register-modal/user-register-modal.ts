import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { RegisterService } from '../../services/register.service';
import { DistrictService } from '../../services/district';
import { BlockService } from '../../services/block';
import { MasterService } from '../../services/master';
import { CryptoService } from '../../services/crypto.service';
import { UserRegisterRequest } from '../../models/register';

@Component({
  selector: 'app-user-register-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-register-modal.html',
  styleUrl: './user-register-modal.css',
})
export class UserRegisterModal implements OnChanges {

  private registerService = inject(RegisterService);
  private districtService = inject(DistrictService);
  private blockService = inject(BlockService);
  private masterService = inject(MasterService);
  private cryptoService = inject(CryptoService);
  private router = inject(Router);

  @Input() isOpen = false;
  @Input() mobileNo = '';
  @Input() deviceId = '';
  @Output() close = new EventEmitter<void>();

  loading = false;
  errorMessage = '';
  successMessage = '';

  districts: { code: string; name: string; nameHN?: string }[] = [];
  blocks: { code: string; name: string }[] = [];
  panchayats: { code: string; name: string }[] = [];
  villages: { code: string; name: string }[] = [];

  genders: { code: string; name: string }[] = [];
  ageGroups: { code: string; name: string }[] = [];
  categories: { code: string; name: string }[] = [];
  qualifications: { code: string; name: string }[] = [];
  occupations: { code: string; name: string }[] = [];
  interests: { code: string; name: string }[] = [];

  
  areaTypeOptions: { code: string; label: string }[] = [
    { code: 'R', label: 'Rural' },
    { code: 'U', label: 'Urban' },
  ];

  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    mobileNo: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    email: new FormControl('', [Validators.email]),
    interests: new FormControl(''),
    distCode: new FormControl(''),
    blockCode: new FormControl(''),
    panchayatCode: new FormControl(''),
    areaType: new FormControl(''),
    villCode: new FormControl(''),
    wardCode: new FormControl(''),
    genderCode: new FormControl(''),
    ageGroupId: new FormControl(''),
    categoryId: new FormControl(''),
    qualificationId: new FormControl(''),
    occupationId: new FormControl(''),
    deviceId: new FormControl(''),
    entryBy: new FormControl(''),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.reset();
      this.loadDistricts();
      this.loadDemographics();
      this.loadQualificationAndOccupation();
      this.loadInterests();
      this.registerForm.patchValue({
        mobileNo: this.mobileNo,
        deviceId: this.deviceId,
        entryBy: this.mobileNo,
      });
    }
  }

  private reset(): void {
    this.loading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.districts = [];
    this.blocks = [];
    this.panchayats = [];
    this.villages = [];
    this.genders = [];
    this.ageGroups = [];
    this.categories = [];
    this.qualifications = [];
    this.occupations = [];
    this.interests = [];
    this.registerForm.reset({
      interests: '',
      distCode: '',
      blockCode: '',
      panchayatCode: '',
      villCode: '',
      genderCode: '',
      ageGroupId: '',
      categoryId: '',
      qualificationId: '',
      occupationId: '',
    });
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
      const decrypted = this.cryptoService.decryptAES(value, clientAES);
      return decrypted || value;
    } catch {
      return value;
    }
  }

  loadDistricts(): void {
    this.districtService.getDistrictList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.districts = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['district_code', 'District_Code', 'district_Code', 'districtcode', 'distCode', 'districtCode'])),
            name: this.decrypt(this.firstValue(item, ['district_name', 'District_Name', 'district_Name', 'districtname', 'distName', 'districtName'])),
            nameHN: this.decrypt(this.firstValue(item, ['district_name_hn', 'District_Name_Hn', 'District_Name_HN', 'district_Name_HN', 'district_Name_Hn', 'districtNameHN'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load districts', err),
    });
  }

  loadBlocks(distCode: string): void {
    this.blocks = [];
    if (!distCode) return;
    this.blockService.getBlockList(distCode).subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.blocks = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['blockcode', 'BlockCode', 'blockCode', 'block_Code'])),
            name: this.decrypt(this.firstValue(item, ['blockname', 'BlockName', 'blockName', 'block_Name'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load blocks', err),
    });
  }

  loadPanchayats(blockCode: string): void {
    this.panchayats = [];
    if (!blockCode) return;
    this.masterService.getPanchayatList(blockCode).subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.panchayats = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['panchayatcode', 'PanchayatCode', 'panchayatCode', 'panchayat_Code'])),
            name: this.decrypt(this.firstValue(item, ['panchayatname', 'PanchayatName', 'panchayatName', 'panchayat_Name'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load panchayats', err),
    });
  }

  loadVillages(panchayatCode: string): void {
    this.villages = [];
    if (!panchayatCode) return;
    console.log('Loading villages for panchayatCode:', panchayatCode);
    this.masterService.getVillageList(panchayatCode).subscribe({
      next: (res: any) => {
        console.log('Village API response:', res);
        if (res?.status && Array.isArray(res.data)) {
          this.villages = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['villcode', 'villCode', 'VillCode', 'VILLCODE', 'villageCode', 'VillageCode', 'vill_Code'])),
            name: this.decrypt(this.firstValue(item, ['villname', 'villName', 'VillName', 'VILLNAME', 'villageName', 'VillageName', 'vill_Name'])),
          }));
        } else {
          console.warn('Villages not populated. status:', res?.status, 'data:', res?.data);
        }
      },
      error: (err) => console.error('Failed to load villages', err),
    });
  }

  loadDemographics(): void {
    this.masterService.getGenderList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.genders = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['gender_code', 'gender_Code', 'genderCode', 'GenderCode'])),
            name: this.decrypt(this.firstValue(item, ['gender_name', 'gender_Name', 'genderName', 'GenderName'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load genders', err),
    });

    this.masterService.getAgeGroupList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.ageGroups = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['id', 'age_group_id', 'ageGroupId', 'age_Group_Id'])),
            name: this.decrypt(this.firstValue(item, ['age_group_name', 'ageGroupName', 'ageGroup_Name'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load age groups', err),
    });

    this.masterService.getCategoryList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.categories = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['category_id', 'category_Id', 'categoryId', 'CategoryID'])),
            name: this.decrypt(this.firstValue(item, ['category_name', 'category_Name', 'categoryName', 'category'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  loadQualificationAndOccupation(): void {
    this.masterService.getQualificationList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.qualifications = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['qualification_id', 'qualification_Id', 'qualificationId', 'QualificationID'])),
            name: this.decrypt(this.firstValue(item, ['qualification_name', 'qualification_Name', 'qualificationName'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load qualifications', err),
    });

    this.masterService.getOccupationList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.occupations = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['occupation_id', 'occupation_Id', 'occupationId', 'OccupationID'])),
            name: this.decrypt(this.firstValue(item, ['occupation_name', 'occupation_Name', 'occupationName'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load occupations', err),
    });
  }

  loadInterests(): void {
    this.masterService.getInterestList().subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          this.interests = res.data.map((item: any) => ({
            code: this.decrypt(this.firstValue(item, ['interest_id', 'interest_Id', 'interestId', 'InterestID'])),
            name: this.decrypt(this.firstValue(item, ['interest_name', 'interest_Name', 'interestName'])),
          }));
        }
      },
      error: (err) => console.error('Failed to load interests', err),
    });
  }

 
  onDistrictChange(): void {
    this.registerForm.patchValue({ blockCode: '', panchayatCode: '', villCode: '' });
    this.blocks = [];
    this.panchayats = [];
    this.villages = [];
    const code = this.registerForm.controls.distCode.value;
    if (code) {
      this.loadBlocks(code);
    }
  }

  onBlockChange(): void {
    this.registerForm.patchValue({ panchayatCode: '', villCode: '' });
    this.panchayats = [];
    this.villages = [];
    const code = this.registerForm.controls.blockCode.value;
    if (code) {
      this.loadPanchayats(code);
    }
  }

  onPanchayatChange(): void {
    this.registerForm.patchValue({ villCode: '' });
    this.villages = [];
    const code = this.registerForm.controls.panchayatCode.value;
    if (code) {
      this.loadVillages(code);
    }
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const v = this.registerForm.value;
    const payload: UserRegisterRequest = {
      name: v.name!,
      mobileNo: v.mobileNo!,
      password: v.password!,
      email: v.email ?? '',
      interests: v.interests ? [Number(v.interests)] : [],
      distCode: Number(v.distCode ?? 0),
      blockCode: Number(v.blockCode ?? 0),
      panchayatCode: Number(v.panchayatCode ?? 0),
      areaType: v.areaType ?? '',
      villCode: Number(v.villCode ?? 0),
      wardCode: v.wardCode ?? '',
      genderCode: Number(v.genderCode ?? 0),
      ageGroupId: Number(v.ageGroupId ?? 0),
      categoryId: Number(v.categoryId ?? 0),
      qualificationId: Number(v.qualificationId ?? 0),
      occupationId: Number(v.occupationId ?? 0),
      deviceId: v.deviceId ?? '',
      entryBy: v.entryBy ?? '',
    };

    this.registerService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
       
        const ok = res.status === true || res.success === true;
        if (ok) {
          const token =
            res.token ||
            res.authToken ||
            (res.data && (res.data.token || res.data.authToken)) ||
            'otp-registered';
          localStorage.setItem('token', token);
          localStorage.setItem('Mobile', payload.mobileNo);
          localStorage.setItem('UserName', payload.name);
          this.close.emit();
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Registration failed. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Register error', err);
        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

}