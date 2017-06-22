import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransactionsDetailsPage } from './transactions-details';

//imports
import { ProductDetailsComponentModule } from '../../components/product-details/product-details.component.module';
 
@NgModule({
  declarations: [
    TransactionsDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(TransactionsDetailsPage),
    ProductDetailsComponentModule
  ],
  exports: [
    TransactionsDetailsPage
  ]
})
export class TransactionsDetailsPageModule {}