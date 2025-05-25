import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';
import { Card } from '../../models/card.model';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';

interface CardToPrint {
  card: Card;
  quantity: number;
}

@Component({
  selector: 'app-card-layout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-layout.component.html',
  styleUrls: ['./card-layout.component.scss']
})
export class CardLayoutComponent implements OnInit {
  cardName: string = '';
  quantity: number = 1;
  errorMessage: string = '';

  addedCards: CardToPrint[] = [];

  private allCards: Card[] = [];
  suggestions: Card[] = [];
  private searchTerms = new Subject<string>();

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.cardService.getCards().subscribe({
      next: (cards) => {
        this.allCards = cards;
        console.log('Todas las cartas cargadas para autocompletado.');
      },
      error: (err) => {
        console.error('Error al cargar todas las cartas para autocompletado:', err);
        this.errorMessage = 'No se pudieron cargar las cartas para el autocompletado. Intenta recargar la página.';
      }
    });

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.filterSuggestions(term))
    ).subscribe(suggestions => {
      this.suggestions = suggestions;
    });
  }

  onCardNameChange(): void {
    if (this.cardName.length >= 2) {
      this.searchTerms.next(this.cardName);
    } else {
      this.suggestions = [];
    }
  }

  private filterSuggestions(term: string): Observable<Card[]> {
    if (!term.trim()) {
      return of([]);
    }
    const lowerCaseTerm = term.toLowerCase();
    const filtered = this.allCards.filter(card =>
      card.name.toLowerCase().includes(lowerCaseTerm)
    ).slice(0, 10);
    return of(filtered);
  }

  selectSuggestion(suggestion: Card): void {
    this.cardName = suggestion.name;
    this.suggestions = [];
  }

  addCardToLayout(): void {
    this.errorMessage = '';

    if (!this.cardName.trim()) {
      this.errorMessage = 'Por favor, introduce el nombre de la carta.';
      return;
    }

    if (this.quantity <= 0) {
      this.errorMessage = 'La cantidad debe ser mayor que cero.';
      return;
    }

    const foundCard = this.allCards.find(card =>
      card.name.toLowerCase() === this.cardName.toLowerCase().trim()
    ) || null;

    if (foundCard) {
      this.addOrUpdateCardInList(foundCard, this.quantity);
      this.cardName = '';
      this.quantity = 1;
      this.suggestions = [];
    } else {
      this.errorMessage = `No se encontró una carta exacta con el nombre "${this.cardName}". Por favor, selecciona de las sugerencias o escribe el nombre completo.`;
    }
  }

  // Nuevo método auxiliar para añadir o actualizar una carta en la lista
  private addOrUpdateCardInList(card: Card, quantityToAdd: number): void {
    const existingCardIndex = this.addedCards.findIndex(item => item.card.code === card.code);

    if (existingCardIndex > -1) {
      this.addedCards[existingCardIndex].quantity += quantityToAdd;
    } else {
      this.addedCards.push({ card: card, quantity: quantityToAdd });
    }
  }


  // ************************************************************
  // NUEVA LÓGICA PARA CARGAR ARCHIVO TXT
  // ************************************************************
  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string;
        this.processTextFileContent(content);
        // Resetea el input file para que el mismo archivo pueda ser cargado de nuevo si es necesario
        target.value = '';
      };

      reader.onerror = (e) => {
        console.error('Error al leer el archivo:', e);
        this.errorMessage = 'Error al leer el archivo. Asegúrate de que es un archivo de texto válido.';
      };

      reader.readAsText(file);
    }
  }

  private processTextFileContent(content: string): void {
    this.errorMessage = '';
    const lines = content.split('\n');
    let cardsProcessed = 0;
    let cardsNotFound = 0;

    // Puedes limpiar la lista actual antes de cargar un nuevo archivo, o añadir a la existente
    // this.addedCards = []; // Descomenta si quieres reemplazar la lista existente

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        continue; // Ignorar líneas vacías o comentarios
      }

      // El formato es: <codigo_de_carta>\t<cantidad>\t<nombre_de_carta>
      // Usamos una expresión regular para manejar espacios extra y asegurar que el formato sea el esperado
      const match = trimmedLine.match(/^(\S+)\t(\d+)\t(.+)$/);

      if (match && match.length === 4) {
        const cardCode = match[1];
        const quantity = parseInt(match[2], 10);
        const cardNameInFile = match[3]; // El nombre de la carta en el archivo (para referencia)

        // Buscar la carta por su CÓDIGO en `allCards`
        const foundCard = this.allCards.find(card =>
          card.code === cardCode
        );

        if (foundCard) {
          this.addOrUpdateCardInList(foundCard, quantity);
          cardsProcessed++;
        } else {
          console.warn(`Carta no encontrada por código: ${cardCode} (Nombre en archivo: ${cardNameInFile})`);
          cardsNotFound++;
        }
      } else {
        console.warn(`Línea con formato inválido o ignorable: "${trimmedLine}"`);
      }
    }

    if (cardsProcessed > 0) {
      console.log(`Se procesaron ${cardsProcessed} cartas del archivo.`);
      if (cardsNotFound > 0) {
        this.errorMessage = `Se cargaron ${cardsProcessed} cartas. ${cardsNotFound} cartas no se encontraron en la base de datos (revisa la consola para detalles).`;
      } else {
        this.errorMessage = `Se cargaron ${cardsProcessed} cartas correctamente.`;
      }
    } else if (cardsNotFound > 0) {
        this.errorMessage = `No se encontraron cartas en la base de datos de tu archivo. Revisa el formato y los códigos de las cartas.`;
    }
    else {
      this.errorMessage = 'No se encontraron cartas válidas en el archivo. Asegúrate del formato (Código\\tCantidad\\tNombre).';
    }
  }
  // ************************************************************
  // FIN NUEVA LÓGICA
  // ************************************************************


  removeCardFromLayout(index: number): void {
    if (index >= 0 && index < this.addedCards.length) {
      this.addedCards.splice(index, 1);
    }
  }

  get flatCardsForPrint(): Card[] {
    const flatList: Card[] = [];
    this.addedCards.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        flatList.push(item.card);
      }
    });
    return flatList;
  }

  printLayout(): void {
    if (this.addedCards.length > 0) {
      window.print();
    } else {
      this.errorMessage = 'Añade al menos una carta para poder imprimir.';
    }
  }
}