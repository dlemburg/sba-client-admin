import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessOrderPage } from './process-order';

// imports
import { ProductDetailsComponentModule } from '../../components/product-details/product-details.component.module';
 
@NgModule({
  declarations: [
    ProcessOrderPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessOrderPage),
    ProductDetailsComponentModule
  ],
  exports: [
    ProcessOrderPage
  ]
})
export class ProcessOrderPageModule {}