import {computed, inject, Injectable} from '@angular/core';
import {BingoService} from "./bingo.service";

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private bingoService = inject(BingoService);

  getTimelineData = computed(() => {
    const cellPlayers = this.bingoService.cellPlayers();
    const players = this.bingoService.players();
    const timeSlots = new Map<string, Map<number, number>>();

    cellPlayers.forEach(cp => {
      const time = new Date(cp.created_at);
      const timeSlot = new Date(time.setMinutes(Math.floor(time.getMinutes() / 15) * 15));
      const slotKey = timeSlot.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      if (!timeSlots.has(slotKey)) {
        timeSlots.set(slotKey, new Map());
      }

      const playerScores = timeSlots.get(slotKey)!;
      playerScores.set(cp.player.id, (playerScores.get(cp.player.id) || 0) + 1);
    });

    return players.map(player => ({
      name: player.name,
      series: Array.from(timeSlots.entries())
        .sort((a, b) => a[0].localeCompare(b[0])) // Tri par ordre chronologique
        .map(([time, scores]) => ({
          name: time,
          value: scores.get(player.id) || 0
        }))
    }));
  });

  getPlayerDistribution = computed(() => {
    const cellPlayers = this.bingoService.cellPlayers();
    const players = this.bingoService.players();

    return players
      .map(player => ({
        name: player.name,
        value: cellPlayers.filter(cp => cp.player.id === player.id).length
      }))
      .filter(item => item.value > 0);
  });

  getCellDistribution = computed(() => {
    const cellPlayers = this.bingoService.cellPlayers();
    const cells = this.bingoService.cells();

    return cells
      .map(cell => ({
        name: cell.content,
        value: cellPlayers.filter(cp => cp.cell.id === cell.id).length
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  });
}
