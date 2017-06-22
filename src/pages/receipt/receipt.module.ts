import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiptPage } from './receipt';
 
@NgModule({
  declarations: [
    ReceiptPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiptPage),
  ],
  exports: [
    ReceiptPage
  ]
})
export class ReceiptPageModule {}