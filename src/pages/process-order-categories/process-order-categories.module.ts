import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessOrderCategoriesPage } from './process-order-categories';
 
@NgModule({
  declarations: [
    ProcessOrderCategoriesPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessOrderCategoriesPage),
  ],
  exports: [
    ProcessOrderCategoriesPage
  ]
})
export class ProcessOrderCategoriesPageModule {}