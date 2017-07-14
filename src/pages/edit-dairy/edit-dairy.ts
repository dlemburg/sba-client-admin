import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, INameAndOid, ICompanyDetails } from '../../models/models';
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

  companyDetails: ICompanyDetails = {};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    private formBuilder: FormBuilder) { 
    super(alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      price: [0, Validators.compose([Validation.test("isMoney"), ...this.doesChargeForDairy()])],
      hasQuantity: [false]
    });
  }

//t this page uses: keyword, category, flavor, size, add-on
  ionViewDidLoad() {
    this.type = this.navParams.data.type.toLowerCase();
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();

    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
      .subscribe(
          (response) => {
            this.companyDetails = response.data.companyDetails;
          }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));
  


    this.API.stack(ROUTES.getDairy + `/${this.type}/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          this.dismissLoading();
          console.log('response: ', response); 
          this.values = response.data.values;
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  doesChargeForDairy() {
    return this.companyDetails.doesChargeForDairy ? [Validation.test("isMoney")] : [];
  }


  selectedValueChange(event, value): void {
    if (this.selectedValue && this.selectedValue.name) {
      this.myForm.patchValue({name: this.selectedValue.name, price: this.selectedValue.price || 0});
      this.editOid = this.selectedValue.oid;
    }
  }

  remove(): void {
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeDairy, 'POST', {companyOid: this.auth.companyOid, editOid: this.editOid})
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().removed);
          setTimeout(() => {
            this.navCtrl.pop();
          }, 1000);
          console.log('response: ', response); 
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  submit(myForm, isValid): void {
    this.presentLoading(AppViewData.getLoading().saving);

    const toData: ToDataEditGeneral = {toData: myForm, editOid: this.editOid, companyOid: this.auth.companyOid };
    this.API.stack(ROUTES.editDairy, 'POST', toData)
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().saved);
          this.navCtrl.pop();
          console.log('response: ', response);
        }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
interface ToDataEditGeneral {
  toData: any;
  companyOid: number;
  editOid: number;
}