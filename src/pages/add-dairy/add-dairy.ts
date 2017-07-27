import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, Validators,} from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, ICompanyDetails } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-add-dairy',
  templateUrl: 'add-dairy.html'
})
export class AddDairyPage extends BaseViewController {
  genericValues: Array<string> = [];  // preloaded
  selectedValues: Array<any> = [];  // selected preloaded
  manualValues: Array<any> = []; // selectedValues + inputValues
  myForm: any;
  type: string = "Dairy";
  auth: AuthUserInfo;
  companyDetails: ICompanyDetails = {};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public API: API, 
    public authentication: Authentication, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    private formBuilder: FormBuilder) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      price: [0, Validators.compose([Validation.test("isMoney"), ...this.doesChargeForDairy()])],
      hasQuantity: [false]
    });
    
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.type = this.navParams.data.type || "dairy";
    this.getCompanyDetailsAPI();
    this.presentLoading();
  }

  doesChargeForDairy() {
    return this.companyDetails.doesChargeForDairy ? [Validation.test("isMoney")] : [];
  }


  getCompanyDetailsAPI() {
    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.companyDetails.doesChargeForDairy = response.data.companyDetails.doesChargeForDairy;
            }, this.errorHandler(this.ERROR_TYPES.API));
  }

  submit(myForm) {
    let toData = myForm;
    this.presentLoading(AppViewData.getLoading().saving);
    this.API.stack(ROUTES.saveDairy, 'POST', {companyOid: this.auth.companyOid, toData})
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.dismissLoading(AppViewData.getLoading().saved);
          setTimeout(() => {
            this.myForm.reset();
          }, 500);
        }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
