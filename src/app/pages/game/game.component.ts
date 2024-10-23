import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {BingoService} from "../../shared/services/bingo.service";
import {BingoBoard, BingoCellPlayer, CreateBingoCell, CreatePlayer, Player} from "../../shared/interfaces/types";
import {FormBuilder} from "@angular/forms";
import { db } from '../../shared/services/db.service';
import {faCrown, faUndo} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  bingoService = inject(BingoService);

  fa = {
    faCrown,
    faUndo
  };

  lastPlayedCell = signal<number | null>(null);
  lastPlayedPlayer = signal<number | null>(null);
  lastPlayInfo = signal<BingoCellPlayer | null>(null);
  isUndoAction = signal<boolean>(false);

  playerScores = computed(() => {
    const scores = new Map<number, number>();
    this.bingoService.players().forEach(player => {
      const score = this.bingoService.cellPlayers()
        .filter(cp => cp.player.id === player.id)
        .length;
      scores.set(player.id, score);
    });
    return scores;
  });

  maxScore = computed(() => {
    let max = 0;
    this.playerScores().forEach(score => {
      if (score > max) max = score;
    });
    return max;
  });

  getCellClasses(cellId: number): string {

    const cellPlayers = this.bingoService.getCellPlayers(cellId);
    const isSelected = this.bingoService.selectedPlayer() !== null;

    let classes = [
      'relative',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'p-2',
      'rounded-lg',
      'text-center',
      'transition-all',
      'border-2',
    ];

// Si la case est vide
    if (cellPlayers.length === 0) {
      classes.push('border-base-300');
      if (isSelected) {
        classes.push('hover:border-primary');
        classes.push('hover:bg-base-200/50');
      }
      return classes.join(' ');
    }

// Si la case a des joueurs
    if (cellPlayers.length >= 1) {
// Une seule couleur
      classes.push('border-base-300');
      classes.push('bg-gradient-to-br');
      classes.push('from-base-300/80');
      classes.push('to-base-300/40');
      return classes.join(' ');
    }

    if (isSelected) {
      classes.push('hover:border-primary');
      classes.push('hover:bg-base-300/90');
    }

    return classes.join(' ');
  }

  getPlayerClasses(player: Player): string {
    const isSelected = this.bingoService.selectedPlayer()?.id === player.id;
    const baseClasses = 'hover:bg-base-300 flex items-center justify-center p-2 rounded-lg transition-all';

    return isSelected
      ? `${baseClasses} bg-base-200 border-2 border-primary`
      : `${baseClasses} bg-base-200/70`;
  }

  getPlayerScore(player: Player): number {
    return this.bingoService.cellPlayers()
      .filter(cp => cp.player.id === player.id)
      .length;
  }

  isWinner(player: Player): boolean {
    const playerScore = this.getPlayerScore(player);
    return playerScore > 0 && playerScore === this.maxScore();
  }

  selectPlayer(player: Player) {
    if (this.bingoService.selectedPlayer()?.id === player.id) {
      this.bingoService.setSelectedPlayer(null);
    } else {
      this.bingoService.setSelectedPlayer(player);
    }
  }

  getUniquePlayers(cellId: number): Player[] {
    const cellPlayers = this.bingoService.getCellPlayers(cellId);
    const uniquePlayersMap = new Map<number, Player>();

    cellPlayers.forEach(cp => {
      if (!uniquePlayersMap.has(cp.player.id)) {
        uniquePlayersMap.set(cp.player.id, cp.player);
      }
    });

    return Array.from(uniquePlayersMap.values());
  }

  async onCellClick(cellId: number) {
    if (!this.bingoService.selectedPlayer()) return;

    this.isUndoAction.set(false);
    // Enregistre le coup
    await this.bingoService.addCellPlayer(
      cellId,
      this.bingoService.selectedPlayer()!.id
    );

// Déclenche les animations
    this.lastPlayedCell.set(cellId);
    this.lastPlayedPlayer.set(this.bingoService.selectedPlayer()!.id);

// Reset les animations après un délai
    setTimeout(() => {
      this.lastPlayedCell.set(null);
      this.lastPlayedPlayer.set(null);
    }, 700);

    await this.loadLastPlay();
  }

  private async loadLastPlay() {
    const lastPlay = await this.bingoService.getLastPlay();
    this.lastPlayInfo.set(lastPlay);
  }

  canUndo(): boolean {
    return this.lastPlayInfo() !== null;
  }

  async undoLastPlay() {
    const lastPlay = await this.bingoService.getLastPlay();
    if (!lastPlay) return;

    this.isUndoAction.set(true);
    // Animation de la cellule et du joueur concernés
    this.lastPlayedCell.set(lastPlay.cell.id);
    this.lastPlayedPlayer.set(lastPlay.player.id);

    await this.bingoService.undoLastPlay();
    await this.loadLastPlay();

    // Reset les animations
    setTimeout(() => {
      this.lastPlayedCell.set(null);
      this.lastPlayedPlayer.set(null);
    }, 700);
  }

  sortedCells = computed(() => {
    return [...this.bingoService.cells()].sort((a, b) =>
      a.content.localeCompare(b.content, 'fr', { sensitivity: 'base' })
    );
  });

  sortedPlayers = computed(() => {
    return [...this.bingoService.players()].sort((a, b) => {
      const scoreA = this.getPlayerScore(a);
      const scoreB = this.getPlayerScore(b);

      // Tri par score décroissant
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // En cas d'égalité, tri par nom
      return a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'});
    });

  });
}
