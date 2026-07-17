import { Component, HostListener, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FontSizeService, FontSize } from '../../services/font-size.service';
import { ColorblindService, ColorblindMode } from '../../services/colorblind.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard-navbar.html',
  styleUrl: './dashboard-navbar.scss'
})
export class DashboardNavbar {

  currentFontSize$!: Observable<FontSize>;
  colorblindMode$!: Observable<ColorblindMode>;
  mobileMenuOpen = false;
  accessibilityDropdownOpen = false;

  constructor(
    private authService: AuthService,
    public fontSizeService: FontSizeService,
    public colorblindService: ColorblindService,
    private elRef: ElementRef
  ){
    this.currentFontSize$ = fontSizeService.currentSize$;
    this.colorblindMode$ = colorblindService.currentMode$;
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

  setColorblindMode(mode: string) {
    this.colorblindService.setMode(mode as ColorblindMode);
  }

  toggleMobileFontMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleAccessibilityDropdown() {
    this.accessibilityDropdownOpen = !this.accessibilityDropdownOpen;
  }
}
