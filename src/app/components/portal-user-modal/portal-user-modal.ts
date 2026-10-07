import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
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

import { Portal } from '../../models/portal';
import { PortalService } from '../../services/portal';
import { CryptoService } from '../../services/crypto.service';

export interface PortalUserType {
  portalId: number | string;
  userTypeId: string;
  userTypeName: string;
  userTypeNameHn: string;
}

@Component({
  selector: 'app-portal-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './portal-user-modal.html',
  styleUrl: './portal-user-modal.css',
})
export class PortalUserModal implements OnChanges {

  private portalService = inject(PortalService);
  private cryptoService = inject(CryptoService);
  private host = inject(ElementRef<HTMLElement>);

  @Input() isOpen = false;
  @Input() portal: Portal | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  portalId: number | null = null;
  deviceId = '';

  userTypes: PortalUserType[] = [];
  userTypesLoading = false;
  userTypesError = '';
  userTypeDropdownOpen = false;

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  step: 'form' | 'otp' = 'form';
  fetchedBeneficiary: any = null;

  userForm = new FormGroup({
    mobileNo: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$'),
    ]),
    session: new FormControl(String(new Date().getFullYear()), [
      Validators.required,
      Validators.pattern('^[0-9]{4}$'),
    ]),
    userType: new FormControl('', [Validators.required]),
  });

  otpForm = new FormGroup({
    otp: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{6}$'),
    ]),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.reset();
      this.initFromPortal();
      this.initDeviceId();
      this.resetSessionToCurrentYear();
      this.loadUserTypes();
    }
  }

  private reset(): void {
    this.submitted = false;
    this.loading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.userTypes = [];
    this.userTypesLoading = false;
    this.userTypesError = '';
    this.userTypeDropdownOpen = false;
    this.step = 'form';
    this.fetchedBeneficiary = null;
    this.userForm.reset();
    this.otpForm.reset();
  }

  private initFromPortal(): void {
    this.portalId = this.portal ? this.portal.portalId : null;
  }

  private initDeviceId(): void {
    let id = localStorage.getItem('deviceId') || '';
    if (!id) {
      try {
        const p = JSON.parse(localStorage.getItem('beneficiaryProfile') || 'null');
        if (p && p.deviceId) {
          id = String(p.deviceId);
        }
      } catch {
      }
    }
    this.deviceId = id;
  }

  private resetSessionToCurrentYear(): void {
    this.userForm.patchValue({
      session: String(new Date().getFullYear()),
    } as any);
  }

  loadUserTypes(): void {
    if (!this.portalId) {
      this.userTypesError = 'No portal selected. Please choose a portal first.';
      return;
    }

    this.userTypesLoading = true;
    this.userTypesError = '';

    this.portalService.getUserType(this.portalId).subscribe({
      next: (res: any) => {
        this.userTypesLoading = false;
        if (res && Array.isArray(res.data)) {
          this.userTypes = res.data.map((item: any) => ({
            portalId: item.Portal_ID ?? item.portal_id,
            userTypeId: String(item.User_Type_ID ?? item.user_type_id ?? ''),
            userTypeName: this.decrypt(item.User_Type_Name ?? item.user_type_name ?? ''),
            userTypeNameHn: this.decrypt(item.User_Type_Name_hn ?? item.user_type_name_hn ?? ''),
          }));
        } else {
          this.userTypes = [];
          this.userTypesError = 'No user types are available for this portal.';
        }
      },
      error: (err) => {
        this.userTypesLoading = false;
        console.error('Failed to load portal user types', err);
        this.userTypesError = 'Failed to load user types. Please try again.';
      },
    });
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

  getPortalInitials(name: string): string {
    if (!name) return 'PT';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  get mobileInvalid(): boolean {
    const c = this.userForm.controls.mobileNo;
    return (c.touched || this.submitted) && c.invalid;
  }

  get sessionInvalid(): boolean {
    const c = this.userForm.controls.session;
    return (c.touched || this.submitted) && c.invalid;
  }

  get userTypeInvalid(): boolean {
    const c = this.userForm.controls.userType;
    return (c.touched || this.submitted) && c.invalid;
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.portalId) {
      this.errorMessage = 'No portal selected. Please choose a portal first.';
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.errorMessage = 'Please fill all the required fields correctly.';
      return;
    }

    const values = this.userForm.value;

    const payload = {
      portal_id: this.portalId,
      mobile_no: values.mobileNo,
      deviceid: this.deviceId,
      session: values.session,
      UserType: values.userType,
    };

    this.loading = true;

    this.portalService.sendPortalOtp(payload).subscribe({
      next: (res: any) => {debugger
        this.loading = false;
        if (res && (res.status === true || res.status === 1 || res.success === true)) {
          const data = res.data;
          const record = Array.isArray(data) ? data[0] : data;
          if (record) {
            this.fetchedBeneficiary = record;
            this.otpForm.reset();
            this.step = 'otp';
            this.successMessage = 'OTP has been sent. Enter the OTP received to verify.';
          } else {
            this.errorMessage = res?.message || 'No beneficiary record found for the given details.';
          }
        } else {
          this.errorMessage = res?.message || 'Failed to send OTP. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Send OTP error', err);
        this.errorMessage = 'An error occurred while sending OTP. Please try again.';
      },
    });
  }

  get otpInvalid(): boolean {
    const c = this.otpForm.controls.otp;
    return (c.touched || this.submitted) && c.invalid;
  }

  getBeneficiaryFields(): { label: string; value: string }[] {
    const b = this.fetchedBeneficiary;
    if (!b) return [];
    const v = (key: string): string => {
      const val = b[key];
      return val === undefined || val === null || val === '' ? '—' : String(val);
    };
    const panchayat = b['panchytName'] ? String(b['panchytName']) : v('panchyatName');
    return [
      { label: 'Beneficiary ID', value: v('beneficiaryID') },
      { label: 'Name', value: v('name') },
      { label: 'DOB', value: v('dob') },
      { label: 'Gender', value: v('gender') },
      { label: 'Mobile No', value: v('mobileNO') },
      { label: 'Category', value: v('categoryName') },
      { label: 'Scheme', value: v('schemeName') },
      { label: 'Scheme Code', value: v('schemeCode') },
      { label: 'Area', value: v('area') },
      { label: 'Village', value: v('villageName') },
      { label: 'Village Code', value: v('villageCode') },
      { label: 'Ward', value: v('wardName') },
      { label: 'Ward Code', value: v('wardCode') },
      { label: 'Panchayat', value: panchayat },
      { label: 'Panchayat Code', value: v('panchyatCode') },
      { label: 'Block', value: v('blockName') },
      { label: 'Block ID', value: v('blockId') },
      { label: 'District', value: v('districtName') },
      { label: 'District ID', value: v('districtId') },
    ];
  }


  verifyOtp(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.otpForm.invalid) {
      this.otpForm.controls.otp.markAsTouched();
      this.errorMessage = 'Please enter the 6-digit OTP received.';
      return;
    }

    const enteredOtp = this.otpForm.value.otp;

    console.log('OTP entered:', enteredOtp, 'for beneficiary:', this.fetchedBeneficiary);
    this.successMessage = 'OTP submitted successfully. Verification flow to be added.';
  }


  get selectedUserTypeLabel(): string {
    const id = this.userForm.controls.userType.value;
    if (!id) return '';
    const match = this.userTypes.find((t) => t.userTypeId === id);
    if (!match) return '';
    return match.userTypeName + (match.userTypeNameHn ? ` (${match.userTypeNameHn})` : '');
  }

  isActiveUserType(type: PortalUserType): boolean {
    return this.userForm.controls.userType.value === type.userTypeId;
  }

  toggleUserTypeDropdown(): void {
    if (this.userTypesLoading) return;
    this.userTypeDropdownOpen = !this.userTypeDropdownOpen;
  }

  selectUserTypeOption(type: PortalUserType): void {
    this.userForm.controls.userType.setValue(type.userTypeId);
    this.userTypeDropdownOpen = false;
    this.userForm.controls.userType.markAsTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.userTypeDropdownOpen) return;
    const dd: Element | null = this.host.nativeElement.querySelector('.ut-dropdown');
    if (dd && !dd.contains(event.target as Node)) {
      this.userTypeDropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeCloseDropdown(): void {
    this.userTypeDropdownOpen = false;
  }

  closeModal(): void {
    this.reset();
    this.close.emit();
  }

}