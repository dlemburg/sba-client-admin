import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductsListPage } from './products-list';

 
@NgModule({
  declarations: [
    ProductsListPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductsListPage),
  ],
  exports: [
    ProductsListPage
  ]
})
export class ProductsListPageModule {}