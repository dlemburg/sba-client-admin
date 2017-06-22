import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditRewardIndividualPage } from './edit-reward-individual';

//imports 
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon.component.module';


 
@NgModule({
  declarations: [
   EditRewardIndividualPage,
  ],
  imports: [
    IonicPageModule.forChild(EditRewardIndividualPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule
  ],
  exports: [
   EditRewardIndividualPage
  ]
})
export class EditRewardIndividualPageModule {}