import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditDairyVarietySweetenerPage } from './edit-dairy-variety-sweetener';

//imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    EditDairyVarietySweetenerPage,
  ],
  imports: [
    IonicPageModule.forChild(EditDairyVarietySweetenerPage),
    ControlMessagesComponentModule
  ],
  exports: [
    EditDairyVarietySweetenerPage
  ]
})
export class EditDairyVarietySweetenerPageModule {}