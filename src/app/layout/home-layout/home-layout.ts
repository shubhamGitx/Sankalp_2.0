import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { OtpLoginModal } from '../../components/otp-login-modal/otp-login-modal';
import { UserRegisterModal } from '../../components/user-register-modal/user-register-modal';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [
    RouterLink,
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
  registerContext = { mobileNo: '', deviceId: '' };

  openOtpLogin() {
    this.isLoginModalOpen = true;
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

}