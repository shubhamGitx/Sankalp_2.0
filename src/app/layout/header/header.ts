import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  constructor(private router: Router) {}

  onToggle(): void {
    this.toggle.emit();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

