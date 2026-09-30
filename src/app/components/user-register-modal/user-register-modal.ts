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
  private router = inject(Router);

  @Input() isOpen = false;
  @Input() mobileNo = '';
  @Input() deviceId = '';
  @Output() close = new EventEmitter<void>();

  loading = false;
  errorMessage = '';
  successMessage = '';

  interestOptions = [
    { label: 'Water Conservation', value: 0 },
    { label: 'Afforestation', value: 1 },
    { label: 'Soil Health', value: 2 },
    { label: 'Renewable Energy', value: 3 },
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
    interests: new FormControl<number[]>([]),
    distCode: new FormControl(0),
    blockCode: new FormControl(0),
    panchayatCode: new FormControl(0),
    areaType: new FormControl(''),
    villCode: new FormControl(0),
    wardCode: new FormControl(''),
    genderCode: new FormControl(0),
    ageGroupId: new FormControl(0),
    categoryId: new FormControl(0),
    qualificationId: new FormControl(0),
    occupationId: new FormControl(0),
    deviceId: new FormControl(''),
    entryBy: new FormControl(''),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.reset();
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
    this.registerForm.reset({
      interests: [],
      distCode: 0,
      blockCode: 0,
      panchayatCode: 0,
      villCode: 0,
      genderCode: 0,
      ageGroupId: 0,
      categoryId: 0,
      qualificationId: 0,
      occupationId: 0,
    });
  }

  toggleInterest(value: number): void {
    const list = this.registerForm.controls.interests.value ?? [];
    const idx = list.indexOf(value);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(value);
    }
    this.registerForm.controls.interests.setValue([...list]);
  }

  isInterestSelected(value: number): boolean {
    return (this.registerForm.controls.interests.value ?? []).includes(value);
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
      interests: v.interests ?? [],
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
        if (res.status) {
          const token = res.token || res.authToken || 'otp-registered';
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