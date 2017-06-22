import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddDairyVarietySweetenerPage } from './add-dairy-variety-sweetener';
import { ControlMessagesComponentModule } from '../../components/control-messages.component.module';
 
@NgModule({
  declarations: [
    AddDairyVarietySweetenerPage,
  ],
  imports: [
    IonicPageModule.forChild(AddDairyVarietySweetenerPage),
    ControlMessagesComponentModule
  ],
  exports: [
    AddDairyVarietySweetenerPage
  ]
})
export class AddDairyVarietySweetenerPageModule {}