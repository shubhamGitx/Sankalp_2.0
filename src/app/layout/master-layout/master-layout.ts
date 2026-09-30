import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-master-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Sidebar,
    Footer
  ],
  templateUrl: './master-layout.html',
  styleUrl: './master-layout.css'
})
export class MasterLayout {

  collapsed = false;

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

}