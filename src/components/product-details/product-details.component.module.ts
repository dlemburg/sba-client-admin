// music-card module
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';  // to use ionic components
import { ProductDetailsComponent } from './product-details.component';

@NgModule({
  declarations: [ProductDetailsComponent],
  imports: [IonicModule],
  exports: [ProductDetailsComponent]
})
export class ProductDetailsComponentModule { }