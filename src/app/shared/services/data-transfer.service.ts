import { Injectable } from '@angular/core';
import * as LZString from 'lz-string';
import { BingoService } from './bingo.service';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  constructor(private bingoService: BingoService) {}

  async generateShareableLink(): Promise<string> {
    try {
      // Récupère les données
      const data = await this.bingoService.exportData();

      // Compresse les données
      const compressed = LZString.compressToEncodedURIComponent(data);

      // Crée l'URL avec les données compressées
      const url = new URL(window.location.href);
      url.searchParams.set('data', compressed);

      return url.toString();
    } catch (error) {
      console.error('Erreur lors de la génération du lien:', error);
      throw error;
    }
  }

  async importFromUrl(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const compressed = urlObj.searchParams.get('data');

      if (!compressed) {
        throw new Error('Aucune donnée trouvée dans l\'URL');
      }

      const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

      if (!decompressed) {
        throw new Error('Erreur lors de la décompression des données');
      }

      await this.bingoService.importData(decompressed);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import depuis l\'URL:', error);
      throw error;
    }
  }
}
