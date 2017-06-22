import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsyncValidation } from '../../global/async-validation.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

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
    /*
    let values = [];
    let selectedValues = false;
    let formValue = false;

    if (this.selectedValues.length) {
      values = [...this.selectedValues];
    } else selectedValues = false;
    if (myForm.name) {
      values = [...values, myForm.name];
    } else formValue = false;
*/
   // if (selectedValues || formValue) {
      this.presentLoading(AppDataService.loading.saving);
      this.API.stack(ROUTES.saveDairyVarietySweetenerValues, 'POST', {name: myForm.name, type: this.type, companyOid: this.auth.companyOid})
        .subscribe(
          (response) => {
            console.log('response: ', response);
            this.dismissLoading(AppDataService.loading.saved);
            this.myForm.reset();
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
          /*
    } else {
      this.showPopup({
        title: "Uh Oh!", 
        message: `You don't have any ${this.type} options ready to be saved!`, 
        buttons: [{text: "OK"}],
        enableBackdropDismiss: true
      });
    }
    */
  }

}
