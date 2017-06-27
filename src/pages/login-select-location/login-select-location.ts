import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController,  ViewController } from 'ionic-angular';
import { ISelectLocation } from '../../models/models';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { AppData } from '../../global/app-data';

@IonicPage()
@Component({
  selector: 'page-login-select-location',
  templateUrl: 'login-select-location.html'
})
export class LoginSelectLocationPage extends BaseViewController {
  locations: Array<ISelectLocation>;
  selectedLocation: ISelectLocation;
  password: string = null;
  preliminaryToken: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public appData: AppData, public viewCtrl: ViewController, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  // params: locations, preliminaryToken
  ionViewDidLoad() {
    this.locations = this.navParams.data.locations;
    this.preliminaryToken = this.navParams.data.preliminaryToken;
  }

  dismiss() {
    this.viewCtrl.dismiss({
      token: null
    });
  }

/*
  dismissAndCallLoginLocation() {
    console.log("selectedLocation: ", this.selectedLocation)
    this.viewCtrl.dismiss({
      location: this.selectedLocation,
      password: this.password
    })
  }
  */

  submit() {
    let toData = { location: this.selectedLocation, password: this.password, preliminaryToken: this.preliminaryToken};
    console.log("toData: ", toData); 
    this.presentLoading();
    /* TODO call */
    this.API.stack(ROUTES.loginSelectLocationAndReturnToken, 'POST', toData)
      .subscribe(
        (response) => {
          console.log('response: ', response);
          // password incorrect and stay here
          this.dismissLoading();

          if (response.code && response.code === 2) {
            this.showPopup({message: "Sorry, this password is incorrect.", buttons: [{text: "OK"}], title: "Uh Oh!"});
          } else {

            // dismiss with data
            this.viewCtrl.dismiss({
              token: response.data.token,
              role: response.data.role
            });
          }

        }, (err) => {
          const shouldPopView = true;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

}
