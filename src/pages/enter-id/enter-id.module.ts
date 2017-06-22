import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnterIDPage } from './enter-id';
 
@NgModule({
  declarations: [
   EnterIDPage,
  ],
  imports: [
    IonicPageModule.forChild(EnterIDPage),
  ],
  exports: [
   EnterIDPage
  ]
})
export class EnterIDPageModule {}