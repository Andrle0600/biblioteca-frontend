import { Component, HostListener, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FontSizeService, FontSize } from '../../services/font-size.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard-navbar.html',
  styleUrl: './dashboard-navbar.scss'
})
export class DashboardNavbar {

  currentFontSize$!: Observable<FontSize>;
  mobileMenuOpen = false;
  accessibilityDropdownOpen = false;

  constructor(
    private authService: AuthService,
    public fontSizeService: FontSizeService,
    private elRef: ElementRef
  ){
    this.currentFontSize$ = fontSizeService.currentSize$;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.accessibilityDropdownOpen = false;
    }
  }

  logout() {
    this.authService.logout();
  }

  setFontSize(size: FontSize) {
    this.fontSizeService.setFontSize(size);
  }

  toggleMobileFontMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleAccessibilityDropdown() {
    this.accessibilityDropdownOpen = !this.accessibilityDropdownOpen;
  }
}
