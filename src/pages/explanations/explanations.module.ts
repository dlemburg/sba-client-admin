import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExplanationsPage } from './explanations';
 
@NgModule({
  declarations: [
   ExplanationsPage,
  ],
  imports: [
    IonicPageModule.forChild(ExplanationsPage),
  ],
  exports: [
   ExplanationsPage
  ]
})
export class ExplanationsPageModule {}