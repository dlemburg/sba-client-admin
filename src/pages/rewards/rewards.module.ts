import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RewardsPage } from './rewards';
import { CompanyLogoComponentModule } from '../../components/company-logo/company-logo.component.module';

 
@NgModule({
  declarations: [
    RewardsPage,
  ],
  imports: [
    IonicPageModule.forChild(RewardsPage),
    CompanyLogoComponentModule
  ],
  exports: [
    RewardsPage
  ]
})
export class RewardsPageModule {}