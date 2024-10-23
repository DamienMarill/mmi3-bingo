import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GameComponent} from "./pages/game/game.component";
import {SettingsComponent} from "./pages/settings/settings.component";
import {StatsComponent} from "./pages/stats/stats.component";

const routes: Routes = [
  {
    path: 'game',
    component: GameComponent
  },
  {
    path: 'stats',
    component: StatsComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: '',
    redirectTo: '/game',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
