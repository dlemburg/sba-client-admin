import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditGeneralPage } from './edit-general';

import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { ImageComponentModule } from '../../components/image/image.component.module';

 
@NgModule({
  declarations: [
    EditGeneralPage,
  ],
  imports: [
    IonicPageModule.forChild(EditGeneralPage),
    ControlMessagesComponentModule,
    ImageComponentModule
  ],
  exports: [
    EditGeneralPage
  ]
})
export class EditGeneralPageModule {}