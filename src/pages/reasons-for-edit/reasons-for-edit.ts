import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { API } from '../../global/api';
import { Authentication } from '../../global/authentication';

@IonicPage()
@Component({
  selector: 'page-reasons-for-edit',
  templateUrl: 'reasons-for-edit.html'
})
export class ReasonsForEditPage {
  reasons: number;

 constructor(
   public navCtrl: NavController, 
   public navParams: NavParams, 
   public API: API, 
   public authentication: Authentication, 
   public viewCtrl: ViewController) { 
  }

  ionViewDidLoad() {
    this.reasons = this.navParams.data.reasons;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
