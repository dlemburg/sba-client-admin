import { Component } from '@angular/core';
import {API, ROUTES} from '../../global/api.service';

import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Validation } from '../../global/validation';
import { AsyncValidation } from '../../global/async-validation.service';
import {Authentication} from '../../global/authentication.service';

import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      price: [0, Validators.compose([Validation.test("money"), ...this.doesChargeForDairy()])],
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
    return this.COMPANY_DETAILS.DOES_CHARGE_FOR_DAIRY ? [Validation.test("money")] : [];
  }


  selectedValueChange(event, value): void {
    if (this.selectedValue && this.selectedValue.name) {
      this.myForm.patchValue({name: this.selectedValue.name, price: this.selectedValue.price || 0});
      this.editOid = this.selectedValue.oid;
    }
  }

  remove(): void {
    this.presentLoading(AppDataService.loading.removing);
    this.API.stack(ROUTES.removeDairy, 'POST', {companyOid: this.auth.companyOid, editOid: this.editOid})
      .subscribe(
        (response) => {
          this.dismissLoading(AppDataService.loading.removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        }, (err) => {
          const shouldPopView = true;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

  submit(myForm, isValid): void {
    this.presentLoading(AppDataService.loading.saving);

    const toData: ToDataEditGeneral = {toData: myForm, editOid: this.editOid, companyOid: this.auth.companyOid };
    this.API.stack(ROUTES.editDairy, 'POST', toData)
      .subscribe(
        (response) => {
          this.dismissLoading(AppDataService.loading.saved);
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