// music-card module
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';  // to use ionic components
import { EmptyMessageComponent } from './empty-message.component';

@NgModule({
  declarations: [EmptyMessageComponent],
  imports: [IonicModule],
  exports: [EmptyMessageComponent]
})
export class EmptyMessageComponentModule { }