import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditTotalPage } from './edit-total';

// imports
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';

 
@NgModule({
  declarations: [
   EditTotalPage,
  ],
  imports: [
    IonicPageModule.forChild(EditTotalPage),
    DollarIconComponentModule
  ],
  exports: [
   EditTotalPage
  ]
})
export class EditTotalPageModule {}