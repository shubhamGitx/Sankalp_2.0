import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

import { Portal } from '../../models/portal';

@Component({
  selector: 'app-portal-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './portal-user-modal.html',
  styleUrl: './portal-user-modal.css',
})
export class PortalUserModal implements OnChanges {

  @Input() isOpen = false;
  @Input() portal: Portal | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  userTypes: string[] = [
    'Select user type',
    'Service Provider',
    'Field Worker',
    'Administrator',
    'Beneficiary',
  ];

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  userForm = new FormGroup({
    userType: new FormControl('', [Validators.required]),
    userId: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.reset();
    }
  }

  private reset(): void {
    this.submitted = false;
    this.loading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.userForm.reset();
  }

  getPortalInitials(name: string): string {
    if (!name) return 'PT';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  get userTypeInvalid(): boolean {
    const c = this.userForm.controls.userType;
    return (c.touched || this.submitted) && c.invalid;
  }

  get userIdInvalid(): boolean {
    const c = this.userForm.controls.userId;
    return (c.touched || this.submitted) && c.invalid;
  }

  get mobileInvalid(): boolean {
    const c = this.userForm.controls.mobile;
    return (c.touched || this.submitted) && c.invalid;
  }

  get passwordInvalid(): boolean {
    const c = this.userForm.controls.password;
    return (c.touched || this.submitted) && c.invalid;
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.portal) {
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
      portalId: this.portal.portalId,
      portalName: this.portal.portalName,
      portalUrl: this.portal.portalUrl,
      userType: values.userType,
      userId: values.userId,
      mobile: values.mobile,
      password: values.password,
    };

    this.loading = true;

    // Simulated async save. Integrate the real portal API call here later.
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Portal credentials saved successfully.';
      this.save.emit(payload);
      this.closeModal();
    }, 450);
  }

  closeModal(): void {
    this.reset();
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

}