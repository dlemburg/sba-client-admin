// music-card module
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';  // to use ionic components
import { ImageComponent } from './image.component';

@NgModule({
  declarations: [ImageComponent],
  imports: [IonicModule],
  exports: [ImageComponent]
})
export class ImageComponentModule { }