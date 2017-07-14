import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-edit-dairy-variety-sweetener',
  templateUrl: 'edit-dairy-variety-sweetener.html'
})
export class EditDairyVarietySweetenerPage extends BaseViewController {
  myForm: any;
  type: string;
  auth: AuthUserInfo;
  values: Array<any> = [];
  editOid: number;
  selectedValue: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public API: API, 
    public authentication: Authentication, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    private formBuilder: FormBuilder) { 
    super(alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.maxLength(45)])],
    });
  }

  ionViewDidLoad() {
    this.type = this.navParams.data.type.toLowerCase();
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();

    this.API.stack(ROUTES.getDairyVarietySweetenerValues + `/${this.type}/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          this.dismissLoading();
          console.log('response: ', response); 
          this.values = response.data.values;
        }, this.errorHandler(this.ERROR_TYPES.API));

  }

  selectedValueChange(event, value): void {
    if (this.selectedValue && this.selectedValue.name) {
      this.myForm.patchValue({name: this.selectedValue.name});
      this.editOid = this.selectedValue.oid;
    }
  }

  remove(): void {
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeDairyVarietySweetener, 'POST', {companyOid: this.auth.companyOid, editOid: this.editOid, type: this.type})
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

    const toData: ToDataEditDairyVarietySweetener = {toData: myForm, editOid: this.editOid, companyOid: this.auth.companyOid, name: myForm.name };
    this.API.stack(ROUTES.editDairyVarietySweetener + `/${this.type}`, 'POST', toData)
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().saved);
          this.navCtrl.pop();
          console.log('response: ', response);
        }, this.errorHandler(this.ERROR_TYPES.API));
  }
}

interface ToDataEditDairyVarietySweetener {
  toData: any;
  companyOid: number;
  editOid: number;
  name: string;
}
