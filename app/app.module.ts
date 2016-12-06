import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { IupacService } from './iupac/iupac.service';

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  providers: [IupacService],
  bootstrap: [AppComponent]
})
export class AppModule { }
