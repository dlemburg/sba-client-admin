import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-add-general',
  templateUrl: 'add-general.html'
})
export class AddGeneralPage extends BaseViewController {
  type: string;
  myForm: FormGroup;
  auth: AuthUserInfo;

  constructor(public navCtrl: NavController, public navParams: NavParams, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45) ]) /*, this.AsyncValidation.isNameNotUniqueAsync(this.type) */],
      img: [null]
    });
  }

  ionViewDidLoad() {
    this.type = this.navParams.data.type;
    this.auth = this.authentication.getCurrentUser();
  }

  submit(myForm, isValid) {
    let type: string = this.type.toLowerCase();

    this.presentLoading(this.appData.getLoading().saving);
    this.API.stack(ROUTES.saveOwnerGeneralAdd + `/${type}`, 'POST', {toData: myForm, isEdit: false, companyOid: this.auth.companyOid })
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
