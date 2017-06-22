import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RewardsDetailsPage } from './rewards-details';
 
@NgModule({
  declarations: [
    RewardsDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(RewardsDetailsPage),
  ],
  exports: [
    RewardsDetailsPage
  ]
})
export class RewardsDetailsPageModule {}