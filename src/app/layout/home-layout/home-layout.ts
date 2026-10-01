import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { inject } from '@angular/core';

import { OtpLoginModal } from '../../components/otp-login-modal/otp-login-modal';
import { UserRegisterModal } from '../../components/user-register-modal/user-register-modal';
import { OtpVerificationResult } from '../../models/otp';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    OtpLoginModal,
    UserRegisterModal
  ],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css'
})
export class HomeLayout {

  private router = inject(Router);

  isLoginModalOpen = false;
  isRegisterModalOpen = false;
  isMobileMenuOpen = false;
  activeMobileDropdown: string | null = null;
  currentLang: 'hi' | 'en' = 'hi';
  registerContext = { mobileNo: '', deviceId: '' };

  openOtpLogin() {
    this.isLoginModalOpen = true;
    this.closeMobileMenu();
  }

  closeOtpLogin() {
    this.isLoginModalOpen = false;
  }

  onOtpVerified(result: OtpVerificationResult) {
    this.isLoginModalOpen = false;
    const { response } = result;

    if (response.data) {
      localStorage.setItem('beneficiaryProfile', JSON.stringify(response.data));
      const token = response.data.token || response.token || response.authToken;
      if (token) {
        localStorage.setItem('beneficiaryToken', token);
      }
      this.router.navigate(['/beneficiary-dashboard']);
      return;
    }

    this.registerContext = {
      mobileNo: result.mobileNo,
      deviceId: result.deviceId,
    };
    this.isRegisterModalOpen = true;
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.activeMobileDropdown = null;
  }

  toggleMobileDropdown(name: string) {
    this.activeMobileDropdown = this.activeMobileDropdown === name ? null : name;
  }

  setLang(lang: 'hi' | 'en') {
    this.currentLang = lang;
  }

}
