import { Component } from '@angular/core';
import {BingoService} from "./shared/services/bingo.service";
import {faChartBar, faCog, faDice} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mmi3-bingo';

  icons = {
    faDice,
    faChartBar,
    faCog
  };

  constructor(
    private bingoService: BingoService
  ) {
    this.bingoService.init();
  }
}
