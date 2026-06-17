import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.html',
  styleUrls: ['./registrar.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
})
export class Registrar {
  registroForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registroForm = this.fb.group({
      dni: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.error = 'Completa todos los campos correctamente';
      return;
    }

    this.http.post('http://localhost:8080/api/auth/registrar', this.registroForm.value, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.toastService.success('¡Registro exitoso! Ya puede iniciar sesión.');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error del servidor:', err);
          if (err.error && typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.status === 0) {
            this.error = 'No se pudo conectar con el servidor';
          } else {
            this.error = 'Error al registrar. Intenta más tarde.';
          }
        }
      });
  }
}
