import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-enter-id',
  templateUrl: 'enter-id.html'
})
export class EnterIDPage {
  paymentID: number;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad EnterIdPage');
  }

  dismiss() {
    this.viewCtrl.dismiss({
      paymentID: null
    });
  }

  dismissWithData() {
    this.viewCtrl.dismiss({
      paymentID:  this.paymentID
    });
  }
}
