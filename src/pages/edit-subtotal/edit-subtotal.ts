import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController, ViewController } from 'ionic-angular';
import { IErrChecks } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { API } from '../../global/api.service';
import { Authentication } from '../../global/authentication.service';
import { UtilityService } from '../../global/utility.service';

@IonicPage()
@Component({
  selector: 'page-edit-subtotal',
  templateUrl: 'edit-subtotal.html'
})
export class EditSubtotalPage extends BaseViewController {
  subtotal: number;
  cacheSubtotal: number;
  reasonForEdit: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public viewCtrl: ViewController) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }
  ionViewDidLoad() {
    this.subtotal = UtilityService.round(this.navParams.data.subtotal);
    this.cacheSubtotal = UtilityService.round(this.navParams.data.subtotal);
  }

  dismissWithNewSubtotal() {
   let checks = this.doChecks(this.subtotal, this.reasonForEdit);

   if (checks.isValid) {
    this.viewCtrl.dismiss({
     isEdited: true, 
     subtotal: +this.subtotal, 
     cacheSubtotal: +this.cacheSubtotal, 
     reasonForEdit: this.reasonForEdit
    });
   } else {
      this.presentToast(false, {message: checks.errs.join(". "), position: "bottom", duration: 1500});
   }
  }

  dismissBack() {
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
