import { Component } from '@angular/core';
import { RouterOutlet,RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [RouterOutlet,RouterLink, RouterLinkActive],
  templateUrl: './dashboard-navbar.html',
  styleUrl: './dashboard-navbar.scss'
})
export class DashboardNavbar {

  constructor(
    private authService: AuthService,  
  ){}

  logout() {
    this.authService.logout();
  }

}
