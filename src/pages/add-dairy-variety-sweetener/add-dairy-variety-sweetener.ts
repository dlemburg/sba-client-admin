import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-add-dairy',
  templateUrl: 'add-dairy-variety-sweetener.html'
})
export class AddDairyVarietySweetenerPage extends BaseViewController {
  genericValues: Array<string>;  // preloaded
  selectedValues: Array<string>;  // selected preloaded
  myForm: any;
  type: string;
  auth: AuthUserInfo;

  COMPANY_DETAILS = {
    DOES_CHARGE_FOR_DAIRY: false
  }
  TYPEs = {
    DAIRY: "Dairy",
    SWEETENER: "Sweetener",
    VARIETY: "Variety"
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.maxLength(45), Validators.required])],
    });
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.type = this.navParams.data.type || "dairy";
    this.presentLoading();
    this.API.stack(ROUTES.getGenericDairyVarietySweetenerValues + `/${this.type}/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.genericValues = response.data.genericValues;
          this.getCompanyDetailsAPI();
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

  getCompanyDetailsAPI() {
    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.COMPANY_DETAILS.DOES_CHARGE_FOR_DAIRY = response.data.companyDetails.doesChargeForDairy;
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  submit(myForm, isValid) {
    this.presentLoading(this.appData.getLoading().saving);
    this.API.stack(ROUTES.saveDairyVarietySweetenerValues, 'POST', {name: myForm.name, type: this.type, companyOid: this.auth.companyOid})
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.dismissLoading(this.appData.getLoading().saved);
          this.myForm.reset();
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

}
