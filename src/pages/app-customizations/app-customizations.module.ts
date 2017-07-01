import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppCustomizationsPage } from './app-customizations';

//imports
import { ControlMessagesComponentModule } from '../../components/control-messages/control-messages.component.module';
import { ImageComponentModule } from '../../components/image/image.component.module';

 
@NgModule({
  declarations: [
    AppCustomizationsPage,
  ],
  imports: [
    IonicPageModule.forChild(AppCustomizationsPage),
    ControlMessagesComponentModule,
    ImageComponentModule
  ],
  exports: [
    AppCustomizationsPage
  ]
})
export class AppCustomizationsPageModule {}