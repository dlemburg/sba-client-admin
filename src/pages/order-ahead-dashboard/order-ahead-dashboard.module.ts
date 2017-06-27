import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderAheadDashboardPage } from './order-ahead-dashboard';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { EmptyMessageComponentModule } from '../../components/empty-message/empty-message.component.module';
import { ProductDetailsComponentModule } from '../../components/product-details/product-details.component.module';

 
@NgModule({
  declarations: [
    OrderAheadDashboardPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderAheadDashboardPage),
    ControlMessagesComponentModule,
    EmptyMessageComponentModule,
    ProductDetailsComponentModule
  ],
  exports: [
    OrderAheadDashboardPage
  ]
})
export class OrderAheadDashboardPageModule {}