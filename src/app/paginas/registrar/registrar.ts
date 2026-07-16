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
   maxFecha = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0]; // ej: "2008-06-18"
  })();

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
      fechaNacimiento: ['', [Validators.required, this.mayorDeEdadValidator]],
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

    this.http.post('https://api.utpbiblio.dpdns.org/api/auth/registrar', this.registroForm.value, { responseType: 'text' })
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

  private mayorDeEdadValidator(control: any) {
    if (!control.value) return null;
    const hoy = new Date();
    const nacimiento = new Date(control.value);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumplioEsteAnio =
      hoy.getMonth() > nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
    return edad > 18 || (edad === 18 && cumplioEsteAnio) ? null : { menorDeEdad: true };
  }
}
