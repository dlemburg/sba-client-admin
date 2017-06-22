import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessOrderProductsPage } from './process-order-products';
 
@NgModule({
  declarations: [
    ProcessOrderProductsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessOrderProductsPage),
  ],
  exports: [
    ProcessOrderProductsPage
  ]
})
export class ProcessOrderProductsPageModule {}