import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() collapsed = false;

  private router = inject(Router);

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  openDashboard() {
    this.router.navigate(['/dashboard']);
  }

  openDistrict() {
    this.router.navigate(['/district']);
  }

  openBlock() {
    this.router.navigate(['/block']);
  }

  openGallery() {
    this.router.navigate(['/gallery-admin']);
  }

  openLogin() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

