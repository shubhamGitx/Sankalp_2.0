import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalService } from '../../services/portal';
import { Portal } from '../../models/portal';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-portal-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portal-list.html',
  styleUrl: './portal-list.css'
})
export class PortalListComponent implements OnInit {

  private cryptoService = inject(CryptoService);
  private portalService = inject(PortalService);
  private cdr = inject(ChangeDetectorRef);

  portals: Portal[] = [];
  searchTerm = '';
  loading = true;

  get filteredPortals(): Portal[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.portals;
    return this.portals.filter(p =>
      (p.portalName || '').toLowerCase().includes(q) ||
      (p.portalUrl || '').toLowerCase().includes(q) ||
      String(p.portalId || '').includes(q)
    );
  }

  ngOnInit(): void {
    this.loadPortals();
  }

  loadPortals() {
    this.loading = true;
    this.portalService.getPortalList().subscribe({
      next: (res: any) => {
        if (res.status) {
          const clientAES = localStorage.getItem('clientAES') || '';
          this.portals = (res.data || []).map((item: any) => ({
            portalId: item.portal_id,
            portalName: this.decrypt(item.portal_name, clientAES),
            portalUrl: this.decrypt(item.portal_url, clientAES),
            portalImagePath: this.decrypt(item.portal_image_path, clientAES),
            isActive: this.isActiveFlag(item.is_active, clientAES)
          }));
          this.cdr.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load portals:', err);
        this.loading = false;
      }
    });
  }

  private decrypt(value: string, clientAES: string): string {
    if (!value) return '';
    try {
      return this.cryptoService.decryptAES(value, clientAES);
    } catch {
      return '';
    }
  }

  private isActiveFlag(value: string, clientAES: string): boolean {
    const raw = this.decrypt(value, clientAES).toUpperCase();
    return raw === 'Y' || raw === 'ACTIVE' || raw === 'TRUE' || raw === '1';
  }

  // Search helpers
  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value || '';
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.cdr.detectChanges();
  }

  // Reload the portal list and reset the search
  onRefresh(): void {
    this.searchTerm = '';
    this.loadPortals();
  }

  getInitials(name: string): string {
    if (!name) return 'PT';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#e0e7ff', '#fce7f3', '#fef3c7', '#dcfce7', '#e0f2fe', '#f3e8ff', '#fee2e2'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getAvatarTextColor(name: string): string {
    const textColors = [
      '#4338ca', '#be185d', '#b45309', '#15803d', '#0369a1', '#7e22ce', '#b91c1c'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return textColors[Math.abs(hash) % textColors.length];
  }

  displayUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : 'https://' + url;
  }
}
