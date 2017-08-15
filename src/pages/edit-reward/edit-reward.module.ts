import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditRewardPage } from './edit-reward';

//imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';
import { ImageComponentModule } from '../../components/image/image.component.module';
import { EmptyMessageComponentModule } from '../../components/empty-message/empty-message.component.module';

 
@NgModule({
  declarations: [
    EditRewardPage,
  ],
  imports: [
    IonicPageModule.forChild(EditRewardPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule,
    ImageComponentModule,
    EmptyMessageComponentModule
  ],
  exports: [
    EditRewardPage
  ]
})
export class EditRewardPageModule {}