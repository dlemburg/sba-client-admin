import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddProductPage } from './add-product';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';

@NgModule({
  declarations: [
    AddProductPage,
  ],
  imports: [
    IonicPageModule.forChild(AddProductPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule
  ],
  exports: [
    AddProductPage
  ]
})
export class AddProductPageModule {}