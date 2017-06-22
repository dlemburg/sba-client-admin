import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditDairyPage } from './edit-dairy';
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    EditDairyPage,
  ],
  imports: [
    IonicPageModule.forChild(EditDairyPage),
    ControlMessagesComponentModule
  ],
  exports: [
    EditDairyPage
  ]
})
export class EditDairyPageModule {}