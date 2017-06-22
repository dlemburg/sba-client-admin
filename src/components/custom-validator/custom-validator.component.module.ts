// music-card module
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';  // to use ionic components
import { CustomValidatorComponent } from './custom-validator.component';

@NgModule({
  declarations: [CustomValidatorComponent],
  imports: [IonicModule],
  exports: [CustomValidatorComponent]
})
export class CustomValidatorComponentModule { }