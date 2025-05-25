import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private manifestUrl = 'assets/cards/cards_manifest.json';

  constructor(private http: HttpClient) {}

  getCards(): Observable<Card[]> {
    return this.http.get<string[]>(this.manifestUrl).pipe(
      switchMap((jsonFilePaths: string[]) => {
        const requests: Observable<Card[]>[] = jsonFilePaths.map(path =>
          this.http.get<Card[]>(path)
        );

        return forkJoin(requests).pipe(
          map((arrayOfCardArrays: Card[][]) => {
            // SOLUCIÓN: Especifica el tipo del array inicial
            return ([] as Card[]).concat(...arrayOfCardArrays);
          })
        );
      })
    );
  }
}