import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginSelectLocationPage } from './login-select-location';
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    LoginSelectLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginSelectLocationPage),
    ControlMessagesComponentModule
  ],
  exports: [
    LoginSelectLocationPage
  ]
})
export class LoginSelectLocationPageModule {}