import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddRewardIndividualPage } from './add-reward-individual';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';
import { ImageComponentModule } from '../../components/image/image.component.module';

@NgModule({
  declarations: [
    AddRewardIndividualPage,
  ],
  imports: [
    IonicPageModule.forChild(AddRewardIndividualPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule,
    ImageComponentModule
  ],
  exports: [
    AddRewardIndividualPage
  ]
})
export class AddRewardIndividualPageModule {}