import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Usuario } from './usuario.model';
declare var bootstrap: any;

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {

  usuarios: Usuario[] = [];
  terminoBusqueda: string = '';

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  buscarUsuario(): void {
    if (this.terminoBusqueda.trim()) {
      this.usuariosService.buscarUsuarios(this.terminoBusqueda).subscribe({
        next: (data) => this.usuarios = data,
        error: (err) => console.error('Error al buscar usuario', err)
      });
    } else {
      this.cargarUsuarios();
    }
  }

  confirmarCambioEstado(usuario: Usuario): void {
    const accion = usuario.enabled ? 'desactivar' : 'activar';
    const mensaje = `¿Está seguro de que desea ${accion} al usuario "${usuario.nombres} ${usuario.apellidos}"?`;

    if (confirm(mensaje)) {
      this.cambiarEstado(usuario);
    }
  }

  cambiarEstado(usuario: Usuario): void {
    const accion = usuario.enabled ? 'desactivarUsuario' : 'activarUsuario';
    const metodo = usuario.enabled
      ? this.usuariosService.desactivarUsuario(usuario.id!)
      : this.usuariosService.activarUsuario(usuario.id!);

    metodo.subscribe({
      next: () => {
        usuario.enabled = !usuario.enabled;
      },
      error: (err) => {
        console.error(`Error al ${accion}`, err);
        alert(`No se pudo ${usuario.enabled ? 'desactivar' : 'activar'} el usuario.`);
      }
    });
  }

}
