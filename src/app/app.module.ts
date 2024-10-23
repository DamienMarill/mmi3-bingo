import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './pages/game/game.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import { SettingsComponent } from './pages/settings/settings.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DataTransferComponent } from './shared/layout/data-transfer/data-transfer.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    SettingsComponent,
    DataTransferComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
