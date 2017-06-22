import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditSubtotalPage } from './edit-subtotal';
 
@NgModule({
  declarations: [
   EditSubtotalPage,
  ],
  imports: [
    IonicPageModule.forChild(EditSubtotalPage),
  ],
  exports: [
   EditSubtotalPage
  ]
})
export class EditSubtotalPageModule {}