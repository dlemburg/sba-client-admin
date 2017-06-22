import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderAheadDashboardPage } from './order-ahead-dashboard';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    OrderAheadDashboardPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderAheadDashboardPage),
    ControlMessagesComponentModule
  ],
  exports: [
    OrderAheadDashboardPage
  ]
})
export class OrderAheadDashboardPageModule {}