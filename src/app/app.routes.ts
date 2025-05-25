import { Routes } from '@angular/router';
import { CardSearchComponent } from './components/card-search/card-search.component';
import { HomeComponent } from './components/home/home.component'; // Vamos a crear este componente

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Ruta para la página de inicio
  { path: 'search', component: CardSearchComponent }, // Ruta para el buscador de cartas
  { path: '**', redirectTo: '' } // Redirige cualquier ruta no definida a la página de inicio
];