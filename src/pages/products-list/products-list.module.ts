import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductsListPage } from './products-list';
import { EmptyMessageComponentModule } from '../../components/empty-message/empty-message.component.module';
 
@NgModule({
  declarations: [
    ProductsListPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductsListPage),
    EmptyMessageComponentModule
  ],
  exports: [
    ProductsListPage
  ]
})
export class ProductsListPageModule {}