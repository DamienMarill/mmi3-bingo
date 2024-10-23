import { Injectable, signal } from '@angular/core';
import {Player, BingoBoard, BingoCell, CreatePlayer, CreateBingoCell, BingoCellPlayer} from '../interfaces/types';
import { db } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class BingoService {
  players = signal<Player[]>([]);
  cells = signal<BingoCell[]>([]);
  cellPlayers = signal<BingoCellPlayer[]>([]);
  selectedPlayer = signal<Player | null>(null);

  async addPlayer(player: CreatePlayer) {
    const id = await db.players.add(player as any); // Le 'as any' est nécessaire car Dexie gère l'id en interne
    await this.loadPlayers();
    return id;
  }

  async updatePlayer(id: number, player: CreatePlayer) {
    await db.players.update(id, player);
    await this.loadPlayers();
  }

  async loadPlayers() {
    const players = await db.players.toArray();
    this.players.set(players);
  }

  async addCell(cell: CreateBingoCell) {
    const id = await db.cells.add(cell as any);
    await this.loadCells();
    return id;
  }

  async updateCell(id: number, cell: CreateBingoCell) {
    await db.cells.update(id, cell);
    await this.loadCells();
  }

  async loadCells() {
    const cells = await db.cells.toArray();
    this.cells.set(cells);
  }

  async loadCellPlayers() {
    const cellPlayers = await db.cellPlayers.toArray();
    this.cellPlayers.set(cellPlayers);
  }

  async addCellPlayer(cellId: number, playerId: number) {
    if (!this.selectedPlayer()) return;

    const player = this.players().find(p => p.id === playerId);
    const cell = this.cells().find(c => c.id === cellId);

    if (!player || !cell) return;

    const newCellPlayer: BingoCellPlayer = {
      cell,
      player,
      created_at: new Date()
    };

    await db.cellPlayers.add(newCellPlayer as any);
    await this.loadCellPlayers();
  }

  getCellPlayers(cellId: number): BingoCellPlayer[] {
    return this.cellPlayers().filter(cp => cp.cell.id === cellId);
  }

  getPlayerCellCount(cellId: number, playerId: number): number {
    return this.cellPlayers()
      .filter(cp => cp.cell.id === cellId && cp.player.id === playerId)
      .length;
  }

// Gestion du joueur sélectionné
  setSelectedPlayer(player: Player | null) {
    this.selectedPlayer.set(player);
  }

// Méthode utilitaire pour vérifier si une cellule est déjà prise
  isCellTaken(cellId: number): boolean {
    return this.cellPlayers().some(cp => cp.cell.id === cellId);
  }

// Méthode pour obtenir le score d'un joueur
  getPlayerScore(playerId: number): number {
    return this.cellPlayers().filter(cp => cp.player.id === playerId).length;
  }

  async getLastPlay(): Promise<BingoCellPlayer | null> {
    const allPlays = await db.cellPlayers
      .orderBy('created_at')
      .reverse()
      .limit(1)
      .toArray();

    return allPlays[0] || null;
  }

  async undoLastPlay() {
    const lastPlay = await this.getLastPlay();
    if (!lastPlay) return;

    // Supprime le dernier coup
    await db.cellPlayers
      .where('created_at')
      .equals(lastPlay.created_at)
      .delete();

    await this.loadCellPlayers();
  }

  async exportData() {
    const data = {
      players: await db.players.toArray(),
      cells: await db.cells.toArray(),
      cellPlayers: await db.cellPlayers.toArray()
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);

      // Validation basique des données
      if (!data.players || !data.cells || !data.cellPlayers) {
        throw new Error('Format de données invalide');
      }

      // Clear existing data
      await db.players.clear();
      await db.cells.clear();
      await db.cellPlayers.clear();

      // Import new data
      await db.players.bulkAdd(data.players);
      await db.cells.bulkAdd(data.cells);
      await db.cellPlayers.bulkAdd(data.cellPlayers);

      // Reload all data
      await this.init();

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw new Error('Erreur lors de l\'import des données');
    }
  }

// Reset de la partie
  async resetGame() {
    await db.cellPlayers.clear();
    await this.loadCellPlayers();
    this.setSelectedPlayer(null);
  }


  async init() {
    await Promise.all([
      this.loadPlayers(),
      this.loadCells(),
      this.loadCellPlayers()
    ]);
  }


}
