import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditPasswordsPage } from './edit-passwords';

// imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';

 
@NgModule({
  declarations: [
    EditPasswordsPage,
  ],
  imports: [
    IonicPageModule.forChild(EditPasswordsPage),
    ControlMessagesComponentModule
  ],
  exports: [
    EditPasswordsPage
  ]
})
export class EditPasswordsPageModule {}