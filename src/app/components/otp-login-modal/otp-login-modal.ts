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

import { OtpService } from '../../services/otp.service';
import { CryptoService } from '../../services/crypto.service';
import {
  SendOtpRequest,
  VerifyOtpRequest,
  OtpVerificationResult,
} from '../../models/otp';

@Component({
  selector: 'app-otp-login-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './otp-login-modal.html',
  styleUrl: './otp-login-modal.css',
})
export class OtpLoginModal implements OnChanges {

  private otpService = inject(OtpService);
  private cryptoService = inject(CryptoService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() verified = new EventEmitter<OtpVerificationResult>();

  step: 'mobile' | 'otp' = 'mobile';
  mobileNo = '';
  deviceId = '';
  clientKey = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  secondsLeft = 0;
  private timer: any;

  mobileForm = new FormGroup({
    mobile: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$'),
    ]),
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
      this.ensureDeviceId();
      this.ensureClientKey();
    }
  }

  private reset(): void {
    this.step = 'mobile';
    this.loading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.mobileNo = '';
    this.mobileForm.reset();
    this.otpForm.reset();
    this.clearTimer();
  }
  // --------------------------------------------------
  // deviceId : auto-fetched / persisted once
  //           = user's current IPv4 address
  // --------------------------------------------------
  private async ensureDeviceId(): Promise<void> {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      const ip = await this.detectLocalIPv4();
      id = ip || this.generateDeviceId();
      localStorage.setItem('deviceId', id);
    }
    this.deviceId = id;
  }

  private detectLocalIPv4(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        let settled = false;
        const finish = (ip: string) => {
          if (!settled) {
            settled = true;
            try {
              pc.close();
            } catch {
            }
            resolve(ip);
          }
        };

        pc.createDataChannel('');
        pc.onicecandidate = (event) => {
          if (!event.candidate) {
            finish('');
            return;
          }
          const match = event.candidate.candidate.match(
            /([0-9]{1,3}(\.[0-9]{1,3}){3})/
          );
          if (match) {
            finish(match[1]);
          }
        };
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => finish(''));

        setTimeout(() => finish(''), 2000);
      } catch (err) {
        console.error('IPv4 detection failed', err);
        resolve('');
      }
    });
  }

  private generateDeviceId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // --------------------------------------------------
  // clientKey : 
  // --------------------------------------------------
  private ensureClientKey(): void {
    let clientAES = localStorage.getItem('clientAES');
    if (!clientAES) {
      clientAES = this.cryptoService.generateAESKey();
      localStorage.setItem('clientAES', clientAES);
    }
    let clientKey = localStorage.getItem('clientKey');
    if (!clientKey) {
      clientKey = this.cryptoService.encryptRSA(clientAES);
      localStorage.setItem('clientKey', clientKey);
    }
    this.clientKey = clientKey;
  }

  async sendOtp(): Promise<void> {
    if (this.mobileForm.invalid) {
      this.mobileForm.markAllAsTouched();
      return;
    }

    const mobile = this.mobileForm.value.mobile!;

    this.mobileNo = mobile;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.clearTimer();

    await this.ensureDeviceId();

    const request: SendOtpRequest = {
      clientKey: this.clientKey,
      mobile,
      deviceId: this.deviceId,
    };

    this.otpService.sendOtp(request).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success || res.status) {
          this.step = 'otp';
          this.successMessage = res.message || 'OTP sent to your mobile number.';
          this.startTimer(60);
        } else {
          this.errorMessage = res.message || 'Unable to send OTP. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('SendOtp error', err);
        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }

  async resendOtp(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    await this.ensureDeviceId();

    const request: SendOtpRequest = {
      clientKey: this.clientKey,
      mobile: this.mobileNo,
      deviceId: this.deviceId,
    };

    this.otpService.sendOtp(request).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = res.message || 'OTP resent successfully.';
          this.startTimer(60);
        } else {
          this.errorMessage = res.message || 'Unable to resend OTP.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('ResendOtp error', err);
        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }
  // --------------------------------------------------
  // Step 2 : verify OTP -> open user registration
  // --------------------------------------------------
  async verifyOtp(): Promise<void> {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    await this.ensureDeviceId();

    const otp = this.otpForm.value.otp!;
    const request: VerifyOtpRequest = {
      mobileNo: this.mobileNo,
      otp,
      DeviceId: this.deviceId,
      clientKey: this.clientKey,
    };

    this.otpService.verifyOtp(request).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success || res.status) {
          
          if (res.userExists || res.data) {
            this.clearTimer();
            this.verified.emit({ response: res, mobileNo: this.mobileNo, deviceId: this.deviceId });
            this.closeModal();
            return;
          }
          this.clearTimer();
          this.verified.emit({ response: res, mobileNo: this.mobileNo, deviceId: this.deviceId });
          this.closeModal();
        } else {
          this.errorMessage = res.message || 'OTP verification failed. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('VerifyOtp error', err);
        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }

  changeMobile(): void {
    this.clearTimer();
    this.step = 'mobile';
    this.errorMessage = '';
    this.successMessage = '';
    this.otpForm.reset();
  }

  private startTimer(seconds: number): void {
    this.clearTimer();
    this.secondsLeft = seconds;
    this.timer = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
      this.secondsLeft = 0;
    }
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
