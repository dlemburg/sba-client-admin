import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { AuthUserInfo, INameAndOid } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-edit-dairy',
  templateUrl: 'edit-dairy.html'
})
export class EditDairyPage extends BaseViewController {
  auth: AuthUserInfo;
  type: string;
  myForm: FormGroup;
  selectedValue: any;
  isSubmitted: boolean;
  editOid: number = null;
  values: Array<INameAndOid> = [];

  COMPANY_DETAILS = {
    DOES_CHARGE_FOR_DAIRY: false
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public validation: Validation, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      price: [0, Validators.compose([this.validation.test("isMoney"), ...this.doesChargeForDairy()])],
      hasQuantity: [false]
    });
  }

//t this page uses: keyword, category, flavor, size, add-on
  ionViewDidLoad() {
    this.type = this.navParams.data.type.toLowerCase();
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();

    this.API.stack(ROUTES.getDairy + `/${this.type}/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          this.dismissLoading();
          console.log('response: ', response); 
          this.values = response.data.values;
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

  doesChargeForDairy() {
    return this.COMPANY_DETAILS.DOES_CHARGE_FOR_DAIRY ? [this.validation.test("isMoney")] : [];
  }


  selectedValueChange(event, value): void {
    if (this.selectedValue && this.selectedValue.name) {
      this.myForm.patchValue({name: this.selectedValue.name, price: this.selectedValue.price || 0});
      this.editOid = this.selectedValue.oid;
    }
  }

  remove(): void {
    this.presentLoading(this.appData.getLoading().removing);
    this.API.stack(ROUTES.removeDairy, 'POST', {companyOid: this.auth.companyOid, editOid: this.editOid})
      .subscribe(
        (response) => {
          this.dismissLoading(this.appData.getLoading().removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        }, (err) => {
          const shouldPopView = true;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

  submit(myForm, isValid): void {
    this.presentLoading(this.appData.getLoading().saving);

    const toData: ToDataEditGeneral = {toData: myForm, editOid: this.editOid, companyOid: this.auth.companyOid };
    this.API.stack(ROUTES.editDairy, 'POST', toData)
      .subscribe(
        (response) => {
          this.dismissLoading(this.appData.getLoading().saved);
          this.navCtrl.pop();
          console.log('response: ', response);
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }
}
interface ToDataEditGeneral {
  toData: any;
  companyOid: number;
  editOid: number;
}