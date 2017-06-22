import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { API, ROUTES } from '../../global/api.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { SocketService } from '../../global/socket.service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage extends BaseViewController {
  bgroundImg: string;
  myForm: FormGroup;
  incorrectPasswordOrEmail: boolean = false;
  loading: any;
  locations: Array<any>;
  auth: AuthUserInfo;

  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, public socketService: SocketService) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  
    this.myForm = this.formBuilder.group({
      email: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ionViewDidLoad() {
    this.bgroundImg = AppDataService.loginBackgroundImg;
  }

  navForgotPassword(): void {
   // this.navCtrl.push(ForgotPasswordPage);
  }

  presentSelectLocationPage(preliminaryCompanyTokenPayload, locations) {
    let preliminaryToken = preliminaryCompanyTokenPayload;
    let selectLocationPage = this.modalCtrl.create('LoginSelectLocationPage', {locations, preliminaryToken}, {enableBackdropDismiss: false});

    selectLocationPage.onDidDismiss((data) => {
      if (data.token) {
        // save token
        const token = data.token;
        this.authentication.saveToken(token);
        this.auth = this.authentication.getCurrentUser();

        // join socket room
        const room = this.auth.companyOid + this.auth.locationOid;
        this.socketService.connect(room);

        // nav
        if (data.role === "Admin") this.navCtrl.setRoot('TabsPage');
        else if (data.role === "Owner") this.navCtrl.setRoot('TabsPage'); //(FingerprintPage);

    } else {
        // do nothing yet
        return;
      }
    });
    selectLocationPage.present();

  }

  submit(myForm, isValid): void {
    this.presentLoading("Logging in...");
    
    let toData = myForm;
    let preliminaryToken = null;
    let locations = [];

    this.API.stack(ROUTES.companyLogin, 'POST', toData)
        .subscribe(
          (response) => {
            this.dismissLoading();
            console.log('response: ', response);

            // incorrect login password or email
            if (response.code === 2) {
              this.showPopup({
                title: AppDataService.defaultErrorTitle, 
                message: response.message || "Sorry, the password or email you entered is incorrect.", 
                buttons: [{text: AppDataService.defaultConfirmButtonText}]
              });
            } else {
              preliminaryToken = response.data.preliminaryCompanyTokenPayload;
              locations = response.data.locations;

              // go to selectLocation page
              this.presentSelectLocationPage(preliminaryToken, locations);  

            }
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }
}