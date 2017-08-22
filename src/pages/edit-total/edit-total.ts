import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController, ViewController } from 'ionic-angular';
import { IErrChecks } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { API } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Utils } from '../../utils/utils';

@IonicPage()
@Component({
  selector: 'page-edit-total',
  templateUrl: 'edit-total.html'
})
export class EditTotalPage extends BaseViewController {
  total: number;
  cacheTotal: number;
  reasonForEdit: string;
  type: string;
  isProcessOrder: boolean = false;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams, 
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
    this.total = Utils.round(this.navParams.data.total);
    this.cacheTotal = Utils.round(this.navParams.data.total);
    this.type = this.navParams.data.type || "total";
    this.isProcessOrder = this.navParams.data.isProcessOrder || false;
  }

  dismissWithNewAmount() {
   let doChecks = this.doChecks(this.total, this.reasonForEdit);

   if (doChecks.isValid) {
    this.viewCtrl.dismiss({
     isEdited: true, 
     total: +this.total, 
     cacheTotal: +this.cacheTotal, 
     reasonForEdit: this.reasonForEdit
    });
   } else {
      this.presentToast(false, doChecks.errs.join(". "));
   }
  }

  dismiss() {
    this.viewCtrl.dismiss({
      isEdited: false, 
      total: this.cacheTotal,
      cacheTotal: null,
      reasonForEdit: null
    });
  }

  doChecks(total, reasonForEdit): IErrChecks {
    let errs = [];

    if (!total.toString().match(/^\d+(?:\.\d{0,2})?$/)) {
      errs.push("Please enter a valid total.")
      return {isValid: false, errs};
    }
    if (!reasonForEdit) {
      errs.push("Please enter a valid reason for editing the total.")
      return {isValid: false, errs};
    }

    else return {isValid: true, errs: []}
    
  }

}
