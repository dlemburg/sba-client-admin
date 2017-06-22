import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AsyncValidation } from '../../global/async-validation.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
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
  values: Array<any>;
  editOid: number;
  selectedValue: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

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
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });

  }

  selectedValueChange(event, value): void {
    if (this.selectedValue && this.selectedValue.name) {
      this.myForm.patchValue({name: this.selectedValue.name});
      this.editOid = this.selectedValue.oid;
    }
  }

  remove(): void {
    this.presentLoading(AppDataService.loading.removing);
    this.API.stack(ROUTES.removeDairyVarietySweetener + `/${this.type}/${this.editOid}/${this.auth.companyOid}`, 'POST')
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

    const toData: ToDataEditDairyVarietySweetener = {toData: myForm, editOid: this.editOid, companyOid: this.auth.companyOid, name: myForm.name };
    this.API.stack(ROUTES.editDairyVarietySweetener + `/${this.type}`, 'POST', toData)
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

interface ToDataEditDairyVarietySweetener {
  toData: any;
  companyOid: number;
  editOid: number;
  name: string;
}
