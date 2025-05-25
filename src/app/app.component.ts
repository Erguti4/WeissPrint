import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Importa RouterOutlet
import { CommonModule } from '@angular/common'; // Asegúrate de tener CommonModule si lo necesitas, aunque para RouterOutlet no es estrictamente necesario en este caso

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, // Añade RouterOutlet aquí
    CommonModule  // Mantén CommonModule si lo utilizas en app.component.html
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Puedes añadir un título o cualquier otra lógica global aquí
  title = 'Buscador de Cartas Pokémon';
}