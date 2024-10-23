// shared/interfaces/types.ts
export interface Player {
  id: number;
  name: string;
  color: string;
}

export type CreatePlayer = Omit<Player, 'id'>;

export interface BingoCell {
  id: number;
  content: string;
}

export type CreateBingoCell = Omit<BingoCell, 'id'>;

export interface BingoBoard {
  cells: BingoCell[];
  size: number;
}

export interface BingoCellPlayer {
  cell: BingoCell;
  player: Player;
  created_at: Date;
}
