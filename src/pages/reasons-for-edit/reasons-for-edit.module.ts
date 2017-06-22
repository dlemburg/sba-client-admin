import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReasonsForEditPage } from './reasons-for-edit';
 
@NgModule({
  declarations: [
    ReasonsForEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ReasonsForEditPage),
  ],
  exports: [
    ReasonsForEditPage
  ]
})
export class ReasonsForEditPageModule {}