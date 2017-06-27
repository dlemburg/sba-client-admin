import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { AppData } from '../../global/app-data';
import * as global from '../../global/global';
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
  //passwordType = global.PASSWORD_TYPES.ADMIN;
  auth: AuthUserInfo;
  didFormChange: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public validation: Validation, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
    this.auth = this.authentication.getCurrentUser();
    
    this.myForm = this.formBuilder.group({
      currentPassword: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      newPassword: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      newPassword2: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
    }, { validator: Validators.compose([this.validation.isMismatch("newPassword", 'newPassword2') ])});
  }

  ionViewDidLoad() {
      this.myForm.valueChanges.subscribe(data => this.onFormChange(data));    // all
      this.type = this.navParams.data.type;
      console.log("type: ", this.type);

  }

  onFormChange(data) {
      this.didFormChange = true;
  }


  submit(myForm: FormControl, isValid: boolean) {
    this.presentLoading(this.appData.getLoading().saving);
    const toData = { companyOid: this.auth.companyOid, type: this.type, toData: myForm };
    
    if (this.didFormChange) {
        this.API.stack(ROUTES.editPasswordCompany, 'POST', toData)
            .subscribe(
            (response) => {
                if (response.code === 2) {
                    this.dismissLoading();
                    this.showPopup({
                        title: this.appData.getPopup().defaultErrorTitle, 
                        message: response.message || "Sorry, the password or email you entered is incorrect.", 
                        buttons: [{text: this.appData.getPopup().defaultConfirmButtonText}]
                    });
                } else {
                    this.dismissLoading(this.appData.getLoading().saved);
                    this.navCtrl.pop();
                    console.log('response: ', response);
                }
            }, 
            (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
    }

  }
}
