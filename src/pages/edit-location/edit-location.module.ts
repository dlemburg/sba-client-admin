import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditLocationPage } from './edit-location';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    EditLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(EditLocationPage),
    ControlMessagesComponentModule
  ],
  exports: [
    EditLocationPage
  ]
})
export class EditLocationPageModule {}