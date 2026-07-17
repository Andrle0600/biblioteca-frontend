import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Question {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

interface Category {
  id: string;
  title: string;
  questions: Question[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss']
})
export class FaqComponent implements OnInit, AfterViewInit {
  categories: Category[] = [
    {
      id: 'cuenta-y-acceso',
      title: 'Cuenta y acceso',
      questions: [
        {
          id: 'cuenta-registro-requerido',
          question: '¿Necesito registrarme para reservar un libro?',
          answer: 'Sí. Debe crear una cuenta e iniciar sesión para acceder a las funciones de préstamo y reserva.',
          isOpen: false
        }
      ]
    },
    {
      id: 'catalogo-y-reservas',
      title: 'Catálogo y reservas de libros',
      questions: [
        {
          id: 'reserva-libro-disponible',
          question: '¿Puedo reservar cualquier libro?',
          answer: 'Solo aquellos que se encuentren disponibles.',
          isOpen: false
        },
        {
          id: 'reserva-cancelar',
          question: '¿Puedo cancelar una reserva?',
          answer: 'Sí. Puede cancelarla desde <strong>Mi cuenta > Mis Préstamos</strong> mientras la reserva siga en estado <strong>pendiente</strong>, es decir, antes de que el bibliotecario la procese y le entregue el ejemplar.',
          isOpen: false
        },
        {
          id: 'reserva-limite-simultaneo',
          question: '¿Cuántos libros puedo reservar al mismo tiempo?',
          answer: 'Solo puede tener <strong>una reserva activa a la vez</strong>. Si desea reservar otro libro mientras tiene una reserva pendiente (aún no recogida), debe cancelarla primero. Si ya recogió el libro (está en préstamo), debe devolverlo antes de poder reservar otro.',
          isOpen: false
        },
        {
          id: 'reserva-recojo-ubicacion',
          question: '¿Dónde recojo el libro una vez aprobada la reserva?',
          answer: 'Debe acercarse a la biblioteca. La ubicación exacta del ejemplar (estante y posición) aparece en el voucher de su reserva.',
          isOpen: false
        }
      ]
    },
    {
      id: 'prestamos-y-devoluciones',
      title: 'Préstamos y devoluciones',
      questions: [
        {
          id: 'prestamo-tiempo',
          question: '¿Cuánto tiempo puedo conservar un libro?',
          answer: 'El tiempo de préstamo es de <strong>2 semanas (14 días)</strong> a partir de la fecha de recojo. Se recomienda devolver el libro antes de la fecha límite para evitar sanciones.',
          isOpen: false
        },
        {
          id: 'sancion-devolucion-tardia',
          question: '¿Qué sucede si no devuelvo el libro a tiempo?',
          answer: 'Podrá recibir una <strong>sanción temporal</strong> que le impedirá realizar nuevos préstamos hasta regularizar su situación. Para evitarlo, revise la fecha límite de devolución y consulte su historial en <strong>Mis Préstamos</strong> para verificar las fechas correspondientes.',
          isOpen: false
        },
        {
          id: 'sancion-libro-danado',
          question: '¿Qué ocurre si el libro se devuelve dañado?',
          answer: 'Se considera daño cuando el ejemplar presenta deterioro ocasionado durante el préstamo: <strong>páginas dobladas o arrancadas</strong>, <strong>escritos o subrayados</strong> sobre el material, manchas, humedad, o cualquier alteración que afecte su estado original. Para evitarlo: manipule el libro con cuidado, no doble las páginas, no escriba sobre el material y manténgalo limpio y protegido. Si se detecta daño al momento de la devolución, la biblioteca aplicará la <strong>sanción correspondiente</strong>.',
          isOpen: false
        }
      ]
    },
    {
      id: 'actividades-culturales',
      title: 'Actividades culturales',
      questions: [
        {
          id: 'actividad-inscripcion',
          question: '¿Cómo me inscribo a una actividad?',
          answer: 'Ingrese al listado de actividades y elija una. Si no ha iniciado sesión, se le pedirá hacerlo (mismo requisito que para reservar un libro). Revise la descripción de la actividad y el expositor a cargo, y confirme su inscripción.',
          isOpen: false
        },
        {
          id: 'actividad-cancelar-inscripcion',
          question: '¿Puedo cancelar mi inscripción a una actividad?',
          answer: 'Sí, puede cancelar su inscripción desde su cuenta mientras la actividad no haya iniciado. Al cancelar, su <strong>cupo queda disponible</strong> para otro usuario interesado.',
          isOpen: false
        },
        {
          id: 'actividad-cupo',
          question: '¿Hay cupo limitado para las actividades?',
          answer: 'Sí, cada actividad tiene un <strong>aforo máximo</strong> de participantes. Los cupos se asignan por <strong>orden de inscripción</strong>, por lo que se recomienda inscribirse con anticipación si la actividad es de su interés.',
          isOpen: false
        }
      ]
    },
    {
      id: 'soporte-y-contacto',
      title: 'Soporte y contacto',
      questions: [
        {
          id: 'soporte-duda-general',
          question: 'Tengo una duda general sobre el uso del sistema, ¿a quién contacto?',
          answer: 'Puede comunicarse con el personal de la biblioteca al correo <strong>contacto@municipalidadate.gob.pe</strong> o al teléfono <strong>987 654 321</strong> (disponibles en el pie de página).',
          isOpen: false
        },
        {
          id: 'soporte-problema-prestamo-actividad',
          question: 'Tengo un problema con una reserva, préstamo o inscripción a una actividad',
          answer: 'Contacte al personal de la biblioteca mediante los datos de contacto del footer (correo: <strong>contacto@municipalidadate.gob.pe</strong> o teléfono: <strong>987 654 321</strong>), indicando el <strong>código de su reserva o actividad</strong>.',
          isOpen: false
        },
        {
          id: 'soporte-problema-tecnico',
          question: 'Tengo un problema técnico con la plataforma (errores, la página no carga, etc.)',
          answer: 'Comuníquese con el administrador de sistemas al número <strong>987 654 321</strong>. Este es un contacto técnico independiente, distinto al correo y teléfono de atención general de biblioteca.',
          isOpen: false
        }
      ]
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.handleFragment(fragment);
      }
    });
  }

  ngAfterViewInit(): void {
    const fragment = this.route.snapshot.fragment;
    if (fragment) {
      setTimeout(() => {
        this.handleFragment(fragment);
      }, 300);
    }
  }

  toggleQuestion(catIndex: number, qIndex: number): void {
    const isCurrentlyOpen = this.categories[catIndex].questions[qIndex].isOpen;
    
    // Close other questions in same category
    this.categories[catIndex].questions.forEach(q => q.isOpen = false);
    
    // Toggle current
    this.categories[catIndex].questions[qIndex].isOpen = !isCurrentlyOpen;
  }

  private handleFragment(fragment: string): void {
    for (let catIndex = 0; catIndex < this.categories.length; catIndex++) {
      const cat = this.categories[catIndex];
      const qIndex = cat.questions.findIndex(q => q.id === fragment);
      if (qIndex !== -1) {
        this.categories[catIndex].questions.forEach(q => q.isOpen = false);
        this.categories[catIndex].questions[qIndex].isOpen = true;
        this.scrollToElement(fragment);
        break;
      }
    }
  }

  private scrollToElement(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }
}
