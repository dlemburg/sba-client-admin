import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SimpleProcessingPage } from './simple-processing';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';

@NgModule({
  declarations: [
    SimpleProcessingPage,
  ],
  imports: [
    IonicPageModule.forChild(SimpleProcessingPage),
    DollarIconComponentModule
  ],
  exports: [
    SimpleProcessingPage
  ]
})
export class SimpleProcessingPageModule {}
