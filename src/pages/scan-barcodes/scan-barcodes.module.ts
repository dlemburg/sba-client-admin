import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScanBarcodesPage } from './scan-barcodes';
import { DollarIconComponentModule } from '../../components/dollar-icon/dollar-icon.component.module';

@NgModule({
  declarations: [
    ScanBarcodesPage,
  ],
  imports: [
    IonicPageModule.forChild(ScanBarcodesPage),
    DollarIconComponentModule
  ],
  exports: [
    ScanBarcodesPage
  ]
})
export class ScanBarcodesPageModule {}
