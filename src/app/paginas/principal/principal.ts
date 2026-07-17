import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './principal.html',
  styleUrl: './principal.scss'
})
export class Principal {
  searchTerm: string = '';

  constructor(private router: Router) {}

  buscarLibro(): void {
    this.router.navigate(['/catalogo'], {
      queryParams: { titulo: this.searchTerm.trim() }
    });
  }
}
