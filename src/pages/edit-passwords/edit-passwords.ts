import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { AppViewData } from '../../global/app-data';
import { BaseViewController} from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-edit-passwords',
  templateUrl: 'edit-passwords.html'
})
export class EditPasswordsPage extends BaseViewController {
  type: string = null;
  myForm: any;
  placeholders: any;
  isSubmitted: boolean;
  loading: any;
  auth: AuthUserInfo;
  formDidChange: boolean = false;
  
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
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

    this.auth = this.authentication.getCurrentUser();
    
    this.myForm = this.formBuilder.group({
      currentPassword: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      newPassword: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      newPassword2: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
    }, { validator: Validators.compose([Validation.isMismatch("newPassword", 'newPassword2') ])});
  }

  ionViewDidLoad() {
      this.myForm.valueChanges.subscribe(data => this.onFormChange(data));    // all
      this.type = this.navParams.data.type;
      console.log("type: ", this.type);
  }

  onFormChange(data) {
      this.formDidChange = true;
  }

  submit(myForm: FormControl, isValid: boolean) {
    this.presentLoading(AppViewData.getLoading().saving);
    const toData = { companyOid: this.auth.companyOid, type: this.type, toData: myForm };
    
    if (this.formDidChange) {
        this.API.stack(ROUTES.editPasswordCompany, 'POST', toData)
            .subscribe(
            (response) => {
                if (response.code === 2) {
                    this.dismissLoading();
                    this.showPopup({
                        title: AppViewData.getPopup().defaultErrorTitle, 
                        message: response.message || "Sorry, the current password you entered is incorrect.", 
                        buttons: [{text: AppViewData.getPopup().defaultConfirmButtonText}]
                    });
                } else {
                    this.dismissLoading(AppViewData.getLoading().saved);
                    setTimeout(() => {
                        this.navCtrl.pop();
                    }, 1000);  
                    console.log('response: ', response);
                }
            }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }
}
