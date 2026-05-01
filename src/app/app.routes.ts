import { Routes } from '@angular/router';
import { Libros } from './dashboard/libros/libros';
import { Dashboard } from './dashboard/dashboard/dashboard';
import { Principal } from './paginas/principal/principal';
import { DashboardNavbar } from './dashboard/dashboard-navbar/dashboard-navbar';
import { PrincipalNavbarComponent } from './paginas/principal-navbar/principal-navbar';
import { Catalogo } from './paginas/catalogo/catalogo';
import { Eventos } from './paginas/eventos/eventos';
import { Detalle } from './paginas/detalle/detalle';
import { Prestamo } from './paginas/prestamo/prestamo';
import { Registrar } from './paginas/registrar/registrar';
import { CuentaComponent } from './paginas/cuenta/cuenta';
import { MisReservas } from './paginas/mis-reservas/mis-reservas';
import { Ejemplares } from './dashboard/ejemplares/ejemplares';
import { Usuarios } from './dashboard/usuarios/usuarios';
import { Reservas } from './dashboard/reservas/reservas';
import { Historial } from './dashboard/historial/historial';
import { Atrasadas } from './dashboard/atrasadas/atrasadas';
import { AdminGuard } from './guards/admin-guard';
export const routes: Routes = [
    {
        path: '',
        component: PrincipalNavbarComponent,
        children: [
            {
                path: '',
                component: Principal
            },
            {
                path: 'catalogo',
                component: Catalogo
            }
            ,
            {
                path: 'eventos',
                component: Eventos
            },

            { path: 'detalle/:slug', loadComponent: () => import('./paginas/detalle/detalle').then(m => m.Detalle) }
            ,
            {
                path: 'prestamo',
                component: Prestamo
            }
            ,
            {
                path: 'prestamo/:slug',
                loadComponent: () => import('./paginas/prestamo/prestamo').then(m => m.Prestamo)
            },
            {
                path: 'detalle',
                component: Detalle
            },
            {
                path: 'prestamo',
                component: Prestamo
            },
            {
                path: 'registrar',
                component: Registrar
            },
            {
                path: 'cuenta',
                component: CuentaComponent
            },
            {
                path: 'mis-reservas',
                component: MisReservas
            }
        ]
    }
    ,



    //dashboard
    {
        path: 'dashboard',
        component: DashboardNavbar,
        canActivate: [AdminGuard],
        children: [
            {
                path: '',
                component: Dashboard
            },
            {
                path: 'libros',
                component: Libros
            },
            {
                path: 'ejemplares',
                component: Ejemplares
            },
            {
                path: 'usuarios',
                component: Usuarios
            }, {
                path: 'reservas',
                component: Reservas
            }, {
                path: 'historial',
                component: Historial
            },{
                path:'atrasadas',
                component: Atrasadas
            }
        ]
    }

];
