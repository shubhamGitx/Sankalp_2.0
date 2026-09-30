import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
   @Input()
  collapsed = false;

  masterOpen = false;
  userOpen = false;
  attendanceOpen = false;

  toggleMaster() {
    this.masterOpen = !this.masterOpen;
  }

  toggleUser() {
    this.userOpen = !this.userOpen;
  }

  toggleAttendance() {
    this.attendanceOpen = !this.attendanceOpen;
  }
  
   private router = inject(Router);
   
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
