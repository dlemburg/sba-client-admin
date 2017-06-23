import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
    ControlMessagesComponentModule
  ],
  exports: [
    LoginPage
  ]
})
export class LoginPageModule {}