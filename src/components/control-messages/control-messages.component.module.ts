// music-card module
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';  // to use ionic components
import { ControlMessagesComponent } from './control-messages.component';

@NgModule({
  declarations: [ControlMessagesComponent],
  imports: [IonicModule],
  exports: [ControlMessagesComponent]
})
export class ControlMessagesComponentModule { }