import { Component, OnInit } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardService } from '../../services/card.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-search.component.html',
  styleUrls: ['./card-search.component.scss']
})
export class CardSearchComponent implements OnInit {
  cards: Card[] = [];           // Lista de todas las cartas (cargadas del servicio)
  filteredCards: Card[] = [];   // Cartas filtradas por el término de búsqueda Y expansión
  paginatedCards: Card[] = [];  // Cartas que se muestran en la página actual

  searchTerm: string = '';
  selectedExpansion: string = ''; // Nueva variable para la expansión seleccionada
  uniqueExpansions: string[] = []; // Lista de expansiones únicas para el desplegable

  // Variables de paginación
  currentPage: number = 1;
  itemsPerPage: number = 12; // Número de cartas a mostrar por página
  totalPages: number = 1;

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.cardService.getCards().subscribe({
      next: (cards) => {
        console.log('Cartas cargadas:', cards);
        this.cards = cards;
        this.extractUniqueExpansions(cards); // Extrae expansiones cuando las cartas se cargan
        this.applyFilterAndPagination(); // Llama a la función que aplica ambos
      },
      error: (err) => {
        console.error('Error cargando cartas:', err);
      }
    });
  }

  // Método para extraer expansiones únicas
  private extractUniqueExpansions(cards: Card[]): void {
    const expansions = new Set<string>(); // Usamos un Set para obtener valores únicos automáticamente
    cards.forEach(card => {
      if (card.expansion) { // Asegúrate de que la carta tenga una propiedad 'expansion'
        expansions.add(card.expansion);
      }
    });
    // Convertir el Set a un array y ordenarlo alfabéticamente
    this.uniqueExpansions = Array.from(expansions).sort();
    // Opcional: Añadir una opción para "Todas" las expansiones al principio
    this.uniqueExpansions.unshift(''); // Representará "Todas las expansiones"
  }

  // Método principal para aplicar filtro y paginación
  private applyFilterAndPagination(): void {
    let currentFilteredCards: Card[] = this.cards; // Empieza con todas las cartas

    // 1. Aplicar filtro de texto
    const term = this.searchTerm.toLowerCase().trim();
    if (term) { // Solo si hay un término de búsqueda
      currentFilteredCards = currentFilteredCards.filter(card =>
        card.name.toLowerCase().includes(term) ||
        card.type.toLowerCase().includes(term) ||
        card.color.toLowerCase().includes(term) ||
        (card.expansion && card.expansion.toLowerCase().includes(term)) // Asegura que expansion exista
      );
    }

    // 2. Aplicar filtro de expansión (si hay una seleccionada)
    if (this.selectedExpansion) {
      currentFilteredCards = currentFilteredCards.filter(card =>
        card.expansion === this.selectedExpansion
      );
    }

    this.filteredCards = currentFilteredCards; // Actualiza las cartas filtradas después de ambos filtros

    // 3. Aplicar paginación
    this.totalPages = Math.ceil(this.filteredCards.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 0; // O 1
    } else if (this.currentPage === 0 && this.totalPages > 0) { // Si vuelve de 0 resultados a tenerlos
        this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCards = this.filteredCards.slice(startIndex, endIndex);
  }

  // Se llama al escribir en el input de búsqueda o al cambiar el desplegable
  // En ambos casos, reiniciamos la página y aplicamos los filtros
  onFilterChange(): void {
    this.currentPage = 1; // Reiniciar a la primera página al cambiar el filtro
    this.applyFilterAndPagination();
  }

  // Métodos para cambiar de página (sin cambios, ya que llaman a applyFilterAndPagination)
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterAndPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilterAndPagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilterAndPagination();
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow && this.totalPages >= maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}