import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompleteOrderConfirmationPage } from './complete-order-confirmation';
 
@NgModule({
  declarations: [
    CompleteOrderConfirmationPage,
  ],
  imports: [
    IonicPageModule.forChild(CompleteOrderConfirmationPage),
  ],
  exports: [
    CompleteOrderConfirmationPage
  ]
})
export class CompleteOrderConfirmationPageModule {}