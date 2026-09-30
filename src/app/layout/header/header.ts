import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor(private router: Router) {}

  logout(): void {
    // alert('Logout Clicked');
    // Remove all saved data
    localStorage.clear();
    // or
    // localStorage.removeItem('token');
    // localStorage.removeItem('UserId');
    // localStorage.removeItem('UserName');

    // Redirect to Login page
    this.router.navigate(['/login']);

    // Alternatively
    // this.router.navigate(['/login']);
  }
}
