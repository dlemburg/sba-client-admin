import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { StatusBar } from "@ionic-native/status-bar";
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AppFeatures } from '../../global/app-features';
import { AuthUserInfo, IClientAdminAppStartupInfoResponse } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { SocketIO } from '../../global/socket-io';
import { BackgroundMode } from '@ionic-native/background-mode';
import { AppStartup } from '../../global/app-startup';

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
  appStartup: AppStartup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams, 
    public backgroundMode: BackgroundMode, 
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    private formBuilder: FormBuilder, 
    public socketIO: SocketIO) { 
      
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
  
    this.myForm = this.formBuilder.group({
      email: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ionViewDidLoad() {    
    // maybe hide tabs here??
    this.authentication.deleteToken();
  }


  presentSelectLocationPage(preliminaryCompanyTokenPayload, locations) {
    let preliminaryToken = preliminaryCompanyTokenPayload;
    let selectLocationPage = this.modalCtrl.create('LoginSelectLocationPage', {locations, preliminaryToken}, {enableBackdropDismiss: false});

    selectLocationPage.onDidDismiss((data) => {
      if (data.token) {
        // save token
        const token = data.token;
        this.authentication.saveToken(token);



        //new stuff here
        this.auth = this.authentication.getCurrentUser();
        this.appStartup = new AppStartup(this.API, this.socketIO);

        this.appStartup.getAppStartupInfo(this.auth.companyOid).then((startupData: IClientAdminAppStartupInfoResponse) => {
          this.appStartup.initializeApp(startupData, this.auth.companyOid, this.auth.locationOid);
          this.finishInitialization(data.role);
        });
        /*
         this.API.stack(ROUTES.getClientAdminAppStartupInfo, "POST", {companyOid: this.auth.companyOid})
          .subscribe(
            (response) => {
              const defaultImg = response.data.imgs.defaultImg;

              AppViewData.setImgs({
                logoImgSrc: `${ROUTES.downloadImg}?img=${response.data.imgs.logoImg}`,
                defaultImgSrc: defaultImg ? `${ROUTES.downloadImg}?img=${defaultImg}` : "img/default.png"
              });
              AppFeatures.setFeatures({
                hasProcessOrder: response.data.appFeatures.hasProcessOrder
              });

              this.finishInitialization(data.role);
            }, this.errorHandler(this.ERROR_TYPES.API));
            */

    } else {
        // do nothing yet
        return;
      }
    });
    selectLocationPage.present();
  }

  finishInitialization(role) {
     
    this.navCtrl.setRoot('TabsPage');

    // originally had these going different routes
    /*
    if (role === "Admin") this.navCtrl.setRoot('TabsPage');
    else if (role === "Owner") this.navCtrl.setRoot('TabsPage');
    */
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
                title: AppViewData.getPopup().defaultErrorTitle, 
                message: response.message || "Sorry, the password or email you entered is incorrect.", 
                buttons: [{text: AppViewData.getPopup().defaultConfirmButtonText}]
              });
            } else {
              preliminaryToken = response.data.preliminaryCompanyTokenPayload;
              locations = response.data.locations;

              // go to selectLocation page
              this.presentSelectLocationPage(preliminaryToken, locations);  

            }
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}