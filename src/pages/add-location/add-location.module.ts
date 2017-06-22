import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddLocationPage } from './add-location';
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

@NgModule({
  declarations: [
    AddLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(AddLocationPage),
    ControlMessagesComponentModule
  ],
  exports: [
    AddLocationPage
  ]
})
export class AddLocationPageModule {}