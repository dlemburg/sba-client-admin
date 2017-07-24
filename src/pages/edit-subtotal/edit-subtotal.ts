import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController, ViewController } from 'ionic-angular';
import { IErrChecks } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { API } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Utils } from '../../utils/utils';

@IonicPage()
@Component({
  selector: 'page-edit-subtotal',
  templateUrl: 'edit-subtotal.html'
})
export class EditSubtotalPage extends BaseViewController {
  subtotal: number;
  cacheSubtotal: number;
  reasonForEdit: string;
  type: string;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams, 
    public utils: Utils, 
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    public viewCtrl: ViewController) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
  }
  ionViewDidLoad() {
    this.subtotal = Utils.round(this.navParams.data.subtotal);
    this.cacheSubtotal = Utils.round(this.navParams.data.subtotal);
    this.type = this.navParams.data.type || "subtotal";
  }

  dismissWithNewAmount() {
   let doChecks = this.doChecks(this.subtotal, this.reasonForEdit);

   if (doChecks.isValid) {
    this.viewCtrl.dismiss({
     isEdited: true, 
     subtotal: +this.subtotal, 
     cacheSubtotal: +this.cacheSubtotal, 
     reasonForEdit: this.reasonForEdit
    });
   } else {
      this.presentToast(false, doChecks.errs.join(". "));
   }
  }

  dismiss() {
    this.viewCtrl.dismiss({
      isEdited: false, 
      subtotal: this.cacheSubtotal,
      cacheSubtotal: null,
      reasonForEdit: null
    });
  }

  doChecks(subtotal, reasonForEdit): IErrChecks {
    let errs = [];

    if (!subtotal.toString().match(/^\d+(?:\.\d{0,2})?$/)) {
      errs.push("Please enter a valid subtotal.")
      return {isValid: false, errs};
    }
    if (!reasonForEdit) {
      errs.push("Please enter a valid reason for editing the subtotal.")
      return {isValid: false, errs};
    }

    else return {isValid: true, errs: []}
    
  }

}
