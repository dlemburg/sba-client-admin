// music-card module
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';  // to use ionic components
import { DollarIconComponent } from './dollar-icon.component';

@NgModule({
  declarations: [DollarIconComponent],
  imports: [IonicModule],
  exports: [DollarIconComponent]
})
export class DollarIconComponentModule { }