// app/components/home/home.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Asegúrate de importar RouterModule

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // ¡Esto es crucial!
  template: `
    <div class="home-container">
  <h1>Bienvenido al Buscador de Cartas</h1>
  <p>Encuentra tus cartas favoritas de forma rápida y sencilla.</p>
  <a routerLink="/search" class="search-button">Ir al Buscador de Cartas</a>
  <a routerLink="/card-layout" class="layout-button">Generar Diseño de Cartas</a> </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { }