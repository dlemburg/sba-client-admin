import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditGeneralPage } from './edit-general';

import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    EditGeneralPage,
  ],
  imports: [
    IonicPageModule.forChild(EditGeneralPage),
    ControlMessagesComponentModule
  ],
  exports: [
    EditGeneralPage
  ]
})
export class EditGeneralPageModule {}