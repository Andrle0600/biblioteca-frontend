import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-principal-navbar',
  templateUrl: './principal-navbar.html',
  styleUrls: ['./principal-navbar.scss'],
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule]
})
export class PrincipalNavbarComponent implements OnInit {
  usuarioAutenticado = false;
  loginForm!: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,  // Usa el AuthService
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.usuarioAutenticado = this.authService.isAuthenticated();
    // Suscribirse a cambios de autenticación
    this.authService.user$.subscribe(user => {
      this.usuarioAutenticado = !!user;
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loginError = null;
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.loginError = 'Credenciales incorrectas o error de conexión.';
      }
    });
  }

  cerrarModal(): void {
    const modalElement = document.getElementById('loginModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        new bootstrap.Modal(modalElement).hide();
      }
    }
  }

  logout() {
    this.authService.logout();
  }

}