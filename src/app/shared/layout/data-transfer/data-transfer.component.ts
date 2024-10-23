import {Component, inject, signal} from '@angular/core';
import {BingoService} from "../../services/bingo.service";
import {faDownload, faLink, faQrcode, faShare, faUpload} from "@fortawesome/free-solid-svg-icons";
import * as QRCode from 'qrcode';
import {DataTransferService} from "../../services/data-transfer.service";
import {ActivatedRoute} from "@angular/router";

interface AlertMessage {
  text: string;
  type: 'alert-success' | 'alert-error' | 'alert-info' | 'alert-warning';
}

@Component({
  selector: 'app-data-transfer',
  templateUrl: './data-transfer.component.html',
  styleUrl: './data-transfer.component.scss'
})
export class DataTransferComponent {
  private bingoService = inject(BingoService);
  private dataTransferService = inject(DataTransferService);
  private route = inject(ActivatedRoute);

  fa = {
    faDownload,
    faUpload,
    faShare,
    faLink,
    faQrcode,
  };

  importData = '';
  qrCodeUrl = signal<string>('');
  shareableLink = signal<string>('');
  alertMessage = signal<AlertMessage | null>(null);

  ngOnInit() {
    // Vérifie si on arrive avec un lien de partage
    this.route.queryParams.subscribe(async params => {
      if (params['data']) {
        try {
          await this.dataTransferService.importFromUrl(window.location.href);
          this.showAlert('Données importées avec succès !', 'alert-success');
          // Nettoie l'URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          this.showAlert('Erreur lors de l\'import des données', 'alert-error');
        }
      }
    });
  }

  async shareData() {
    try {
      const link = await this.dataTransferService.generateShareableLink();
      this.shareableLink.set(link);

      // Génère le QR code avec le lien
      await this.generateQrCode(link);

      // Utilise l'API Web Share si disponible
      if (navigator.share) {
        await navigator.share({
          title: 'Données Bingo',
          text: 'Voici mes données Bingo !',
          url: link
        });
      }
    } catch (error) {
      this.showAlert('Erreur lors de la génération du lien', 'alert-error');
    }
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.shareableLink());
      this.showAlert('Lien copié !', 'alert-success');
    } catch (error) {
      this.showAlert('Erreur lors de la copie du lien', 'alert-error');
    }
  }

  async generateQrCode(url: string): Promise<void> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'L' // On peut utiliser 'L' car le lien est court
      });
      this.qrCodeUrl.set(qrCodeDataUrl);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      this.showAlert('Erreur lors de la génération du QR code', 'alert-error');
    }

  }

  async downloadJson() {
    try {
      const data = await this.bingoService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bingo-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.showAlert('Données exportées avec succès !', 'alert-success');
    } catch (error) {
      this.showAlert('Erreur lors de l\'export des données', 'alert-error');
    }
  }

  async downloadQrCode() {
    if (!this.qrCodeUrl()) return;

    const link = document.createElement('a');
    link.href = this.qrCodeUrl();
    link.download = `bingo-share-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showAlert('QR code téléchargé !', 'alert-success');
  }

  async importJson() {
    try {
      await this.bingoService.importData(this.importData);
      this.importData = '';
      this.showAlert('Données importées avec succès !', 'alert-success');
    } catch (error) {
      this.showAlert(
        'Erreur lors de l\'import. Vérifiez le format de vos données.',
        'alert-error'
      );
    }
  }

  private showAlert(text: string, type: AlertMessage['type']): void {
    this.alertMessage.set({ text, type });
    setTimeout(() => this.alertMessage.set(null), 3000);
  }
}
