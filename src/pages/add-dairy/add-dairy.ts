import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api.service';
import { FormBuilder, Validators,} from '@angular/forms';
import { Validation } from '../../global/validation';
import { AsyncValidation } from '../../global/async-validation.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
import { AuthUserInfo } from '../../models/models';
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

  COMPANY_DETAILS = {
    DOES_CHARGE_FOR_DAIRY: false
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      price: [0, Validators.compose([Validation.test("money"), ...this.doesChargeForDairy()])],
      hasQuantity: [false]
    });
    
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.type = this.navParams.data.type || "dairy";
    this.getCompanyDetailsAPI();
    this.presentLoading();

    /*
    this.API.stack(ROUTES.getGenericDairyVarietySweetenerValues + `/${this.type}/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.genericValues = response.data.genericValues.map((x) => {
             return {name: x, price: x.price || null};
          });
          this.getCompanyDetailsAPI();
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });
      */
  }

  doesChargeForDairy() {
    return this.COMPANY_DETAILS.DOES_CHARGE_FOR_DAIRY ? [Validation.test("money")] : [];
  }


  getCompanyDetailsAPI() {
    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.COMPANY_DETAILS.DOES_CHARGE_FOR_DAIRY = true || response.data.companyDetails.doesChargeForDairy;
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  submit(myForm) {
    let toData = myForm;
    this.presentLoading(AppDataService.loading.saving);
    this.API.stack(ROUTES.saveDairy, 'POST', {companyOid: this.auth.companyOid, toData})
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.dismissLoading(AppDataService.loading.saved);
          this.myForm.reset();
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }
}
