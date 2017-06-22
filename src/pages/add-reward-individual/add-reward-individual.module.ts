import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddRewardIndividualPage } from './add-reward-individual';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon.component.module';


 
@NgModule({
  declarations: [
    AddRewardIndividualPage,
  ],
  imports: [
    IonicPageModule.forChild(AddRewardIndividualPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule
  ],
  exports: [
    AddRewardIndividualPage
  ]
})
export class AddRewardIndividualPageModule {}