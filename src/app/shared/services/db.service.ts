import Dexie, { Table } from 'dexie';
import { Player, BingoCell, BingoCellPlayer } from '../interfaces/types';

export class BingoDatabase extends Dexie {
  players!: Table<Player>;
  cells!: Table<BingoCell>;
  cellPlayers!: Table<BingoCellPlayer>;

  constructor() {
    super('BingoDb');
    this.version(1).stores({
      players: '++id, name, color',
      cells: '++id, content',
      cellPlayers: '++id, cellId, playerId, created_at'
    });
  }
}

export const db = new BingoDatabase();
