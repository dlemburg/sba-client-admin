import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommentPage } from './comment';
 
@NgModule({
  declarations: [
    CommentPage,
  ],
  imports: [
    IonicPageModule.forChild(CommentPage),
  ],
  exports: [
    CommentPage
  ]
})
export class CommentPageModule {}