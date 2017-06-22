import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-comment',
  templateUrl: 'comment.html'
})
export class CommentPage {
  comment: string = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {}

  ionViewDidLoad() {
    this.comment = this.navParams.data.comment;
  }

  dismiss() {
    this.viewCtrl.dismiss({
      comment: null
    });
  }

  dismissWithData() {
    this.viewCtrl.dismiss({
      comment: this.comment
    });
  }
}
