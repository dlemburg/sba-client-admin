import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductsDetailsPage } from './products-details';
import { CompanyLogoComponentModule } from '../../components/company-logo/company-logo.component.module';

@NgModule({
  declarations: [
    ProductsDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductsDetailsPage),
    CompanyLogoComponentModule
  ],
  exports: [
    ProductsDetailsPage
  ]
})
export class ProductsDetailsPageModule {}