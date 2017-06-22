import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController, ViewController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { API } from '../../global/api.service';
import { Authentication } from '../../global/authentication.service';

@IonicPage()
@Component({
  selector: 'page-reasons-for-edit',
  templateUrl: 'reasons-for-edit.html'
})
export class ReasonsForEditPage extends BaseViewController {
  reasons: number;

 constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public viewCtrl: ViewController) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    this.reasons = this.navParams.data.reasons;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
