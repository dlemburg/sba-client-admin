import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, IClientAdminAppStartupInfoResponse } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { SocketIO } from '../../global/socket-io';
import { BackgroundMode } from '@ionic-native/background-mode';
import { AppStartup } from '../../global/app-startup';
import { NativeNotifications } from '../../global/native-notifications';

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
  locations: Array<any> = [];
  auth: AuthUserInfo;
  appStartup: AppStartup;
  logo: string = "img/logo.png";
  isLoadingVisible: boolean = false;

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
    public nativeNotifications: NativeNotifications,
    public socketIO: SocketIO) { 
      
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
  
    this.myForm = this.formBuilder.group({
      email: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ionViewDidLoad() {    
    this.authentication.deleteToken();
  }

  ionViewDidLeave() {
    this.isLoadingVisible ? this.dismissLoading() : null;
    this.isLoadingVisible = false;
  }

  presentSelectLocationPage(preliminaryCompanyTokenPayload, locations) {
    let preliminaryToken = preliminaryCompanyTokenPayload;
    let selectLocationPage = this.modalCtrl.create('LoginSelectLocationPage', {locations, preliminaryToken}, {enableBackdropDismiss: false});

    selectLocationPage.onDidDismiss((data) => {
      if (data && data.token) {
        this.saveTokenAndInitializeApp(data.token, data.role); 
      } else return;
    });
    selectLocationPage.present();
  }

  saveTokenAndInitializeApp(token, role) {
    // show loading... this takes a few seconds
    this.presentLoading("Acquiring company settings...");
    this.isLoadingVisible = true;

    // save token
    this.authentication.saveToken(token);

    //app startup stuff here
    this.auth = this.authentication.getCurrentUser();
    this.appStartup = new AppStartup(this.API, this.socketIO, this.nativeNotifications);

    this.appStartup.getAppStartupInfo(this.auth.companyOid).then((startupData: IClientAdminAppStartupInfoResponse) => {
      this.appStartup.initializeApp(startupData, this.auth.companyOid, this.auth.locationOid);
      this.finishInitialization(role);
    });
  }

  finishInitialization(role) {
    this.navCtrl.setRoot('TabsPage');
  }

  alertInvalidAndRedirect() {
    this.showPopup({
      title: "No locations found!", 
      message: "Please have the owner create a location before allowing Admins to login.",
      buttons: [
        {text: "OK", handler: () => { this.navCtrl.setRoot("LoginPage")}}
      ]
    })
  }

  submit(myForm, isValid): void {
    this.presentLoading("Logging in...");
    let toData = myForm;

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
              const { preliminaryCompanyTokenPayload, token, locations, role } = response.data;

              // EXPLANATION:
              // if has locations, make them login to location; if no locations, proceed
              // if admin and no locations, redirect back to login
              if (locations.length) this.presentSelectLocationPage(preliminaryCompanyTokenPayload, locations);
              else if (role === "Admin" && !locations.length) this.alertInvalidAndRedirect();
              else if (!locations.length && token && role === "Owner") this.saveTokenAndInitializeApp(token, role);
              else console.log("uh oh, no solution for this yet...");
            }
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}