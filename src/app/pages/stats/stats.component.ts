import {Component, computed, effect, inject, OnInit} from '@angular/core';
import {StatsService} from "../../shared/services/stats.service";
import {BingoService} from "../../shared/services/bingo.service";
import {LegendPosition, ScaleType} from "@swimlane/ngx-charts";

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  private bingoService = inject(BingoService);
  statsService = inject(StatsService);
  colorScheme = {
    name: 'player-colors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [] as string[]
  };
  defaultColorScheme = {
    name: 'default-colors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFBE0B', '#FF006E', '#8338EC', '#3A86FF'
    ]
  };
  constructor() {
// Mettre à jour les couleurs lorsque les joueurs changent
    effect(() => {
      this.colorScheme = {
        ...this.colorScheme,
        domain: this.bingoService.players().map(p => p.color)
      };
    });
  }

}
