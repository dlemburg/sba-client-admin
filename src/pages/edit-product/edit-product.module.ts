import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProductPage } from './edit-product';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';

 
@NgModule({
  declarations: [
    EditProductPage,
  ],
  imports: [
    IonicPageModule.forChild(EditProductPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule
  ],
  exports: [
    EditProductPage
  ]
})
export class EditProductPageModule {}