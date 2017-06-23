import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddGeneralPage } from './add-general';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

@NgModule({
  declarations: [
    AddGeneralPage,
  ],
  imports: [
    IonicPageModule.forChild(AddGeneralPage),
    ControlMessagesComponentModule
  ],
  exports: [
    AddGeneralPage
  ]
})
export class AddGeneralPageModule {}