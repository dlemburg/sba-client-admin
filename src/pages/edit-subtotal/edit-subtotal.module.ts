import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditSubtotalPage } from './edit-subtotal';

// imports
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';

 
@NgModule({
  declarations: [
   EditSubtotalPage,
  ],
  imports: [
    IonicPageModule.forChild(EditSubtotalPage),
    DollarIconComponentModule
  ],
  exports: [
   EditSubtotalPage
  ]
})
export class EditSubtotalPageModule {}