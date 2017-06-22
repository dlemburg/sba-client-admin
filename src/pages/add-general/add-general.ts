import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AsyncValidation } from '../../global/async-validation.service';
import { IErrChecks } from '../../models/models';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

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

    this.presentLoading(AppDataService.loading.saving);
    this.API.stack(ROUTES.saveOwnerGeneralAdd + `/${type}`, 'POST', {toData: myForm, isEdit: false, companyOid: this.auth.companyOid })
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
