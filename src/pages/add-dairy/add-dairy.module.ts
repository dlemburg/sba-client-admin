import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddDairyPage } from './add-dairy';
import { ControlMessagesComponentModule } from '../../components/control-messages.component.module';

@NgModule({
  declarations: [
    AddDairyPage,
  ],
  imports: [
    IonicPageModule.forChild(AddDairyPage),
    ControlMessagesComponentModule
  ],
  exports: [
    AddDairyPage
  ]
})
export class AddDairyPageModule {}