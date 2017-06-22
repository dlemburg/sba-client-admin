import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppImagesPage } from './app-images';
 
@NgModule({
  declarations: [
    AppImagesPage,
  ],
  imports: [
    IonicPageModule.forChild(AppImagesPage),
  ],
  exports: [
    AppImagesPage
  ]
})
export class AppImagesPageModule {}