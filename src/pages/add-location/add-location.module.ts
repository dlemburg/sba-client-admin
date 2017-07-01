import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddLocationPage } from './add-location';
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { ImageComponentModule } from '../../components/image/image.component.module';

@NgModule({
  declarations: [
    AddLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(AddLocationPage),
    ControlMessagesComponentModule,
    ImageComponentModule
  ],
  exports: [
    AddLocationPage
  ]
})
export class AddLocationPageModule {}