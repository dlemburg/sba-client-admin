import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddDairyPage } from './add-dairy';
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';

@NgModule({
  declarations: [
    AddDairyPage,
  ],
  imports: [
    IonicPageModule.forChild(AddDairyPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule
  ],
  exports: [
    AddDairyPage
  ]
})
export class AddDairyPageModule {}