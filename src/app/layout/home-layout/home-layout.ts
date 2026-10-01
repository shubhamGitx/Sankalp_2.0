import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { OtpLoginModal } from '../../components/otp-login-modal/otp-login-modal';
import { UserRegisterModal } from '../../components/user-register-modal/user-register-modal';

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

  onOtpVerified(data: { mobileNo: string; deviceId: string }) {
    this.isLoginModalOpen = false;
    this.registerContext = data;
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