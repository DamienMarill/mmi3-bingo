import {Component, inject, signal} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {BingoService} from "../../shared/services/bingo.service";
import {BingoCell, CreateBingoCell, CreatePlayer, Player} from "../../shared/interfaces/types";
import {db} from "../../shared/services/db.service";
import {faEdit,faTrash} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  bingoService = inject(BingoService);

  fa= {
    faEdit,
    faTrash
  }

  editingPlayerId = signal<number | null>(null);
  editingCellId = signal<number | null>(null);

  playerForm = this.fb.group({
    name: [''],
    color: ['#ff0000']
  });

  cellForm = this.fb.group({
    content: ['']
  });

  // Player Methods
  async submitPlayer() {
    if (this.playerForm.valid) {
      const playerData = this.playerForm.value as CreatePlayer;

      if (this.editingPlayerId()) {
        await this.bingoService.updatePlayer(this.editingPlayerId()!, playerData);
        this.cancelPlayerEdit();
      } else {
        await this.bingoService.addPlayer(playerData);
      }

      this.playerForm.reset({ color: '#ff0000' });
    }
  }

  editPlayer(player: Player) {
    this.editingPlayerId.set(player.id);
    this.playerForm.patchValue({
      name: player.name,
      color: player.color
    });
  }

  cancelPlayerEdit() {
    this.editingPlayerId.set(null);
    this.playerForm.reset({ color: '#ff0000' });
  }

  // Cell Methods
  async submitCell() {
    if (this.cellForm.valid) {
      const cellData = this.cellForm.value as CreateBingoCell;

      if (this.editingCellId()) {
        await this.bingoService.updateCell(this.editingCellId()!, cellData);
        this.cancelCellEdit();
      } else {
        await this.bingoService.addCell(cellData);
      }

      this.cellForm.reset();
    }
  }

  editCell(cell: BingoCell) {
    this.editingCellId.set(cell.id);
    this.cellForm.patchValue({
      content: cell.content
    });
  }

  cancelCellEdit() {
    this.editingCellId.set(null);
    this.cellForm.reset();
  }

  // Delete methods
  async deletePlayer(id: number) {
    if (confirm('Es-tu sûr de vouloir supprimer ce joueur ?')) {
      await db.players.delete(id);
      await this.bingoService.loadPlayers();
      if (this.editingPlayerId() === id) {
        this.cancelPlayerEdit();
      }
    }
  }

  async deleteCell(id: number) {
    if (confirm('Es-tu sûr de vouloir supprimer cette case ?')) {
      await db.cells.delete(id);
      await this.bingoService.loadCells();
      if (this.editingCellId() === id) {
        this.cancelCellEdit();
      }
    }
  }
}
