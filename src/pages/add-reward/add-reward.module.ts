import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddRewardPage } from './add-reward';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';


@NgModule({
  declarations: [
    AddRewardPage,
  ],
  imports: [
    IonicPageModule.forChild(AddRewardPage),
    ControlMessagesComponentModule,
    DollarIconComponentModule
  ],
  exports: [
    AddRewardPage
  ]
})
export class AddRewardPageModule {}