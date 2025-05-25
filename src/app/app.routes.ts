import { Routes } from '@angular/router';
import { CardSearchComponent } from './components/card-search/card-search.component';
import { HomeComponent } from './components/home/home.component';
import { CardLayoutComponent } from './components/card-layout/card-layout.component'; // ¡Importa el nuevo componente!

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: CardSearchComponent },
  { path: 'card-layout', component: CardLayoutComponent }, // ¡Añade esta nueva ruta!
  { path: '**', redirectTo: '' }
];