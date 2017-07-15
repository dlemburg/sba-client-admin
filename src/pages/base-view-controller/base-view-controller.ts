import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { ENV } from '../../global/global';
import { Utils } from '../../global/utils/utils';
import { Authentication } from '../../global/authentication';
import { IErrorHandlerOpts } from '../../models/models';

import { NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { IPopup } from '../../models/models';


@Component({
  selector: 'page-base-view-controller',
  templateUrl: 'base-view-controller.html'
})

export class BaseViewController {
  public loading: any;
  public ERROR_TYPES = {
    PLUGIN: {
      CAMERA: "CAMERA",
      BARCODE: "BARCODE",
      PRINTER: "PRINTER",
      GEOLOCATION: "GEOLOCATION"
    },
    API: "API",
    IMG_UPLOAD: "IMG UPLOAD",
    UNHANDLED_EXCEPTION: "UNHANDLED EXCEPTION"
  }
  public APPEND_DEFAULT_ERR_MESSAGE: "We will work hard to ensure that this is not a problem on our end"
  public ERROR_MESSAGES = {
    CAMERA: `Sorry, there was an error retrieving your photo.  ${this.APPEND_DEFAULT_ERR_MESSAGE}`,
    BARCODE: `sorry, there was an error accessing the scanner. ${this.APPEND_DEFAULT_ERR_MESSAGE}`,
    PRINTER: `Sorry, there was an error either finding a printer or printing. ${this.APPEND_DEFAULT_ERR_MESSAGE}`,
    IMG_UPLOAD: `Sorry, there was an error uploading your image. ${this.APPEND_DEFAULT_ERR_MESSAGE}`,
    GEOLOCATION: `Sorry, there was an error calculating your position. ${this.APPEND_DEFAULT_ERR_MESSAGE}`
  }
  constructor(public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController ) {
  }

  // app-wide error-handler
  public errorHandler(errorType = "No type given", message = AppViewData.getToast().defaultErrorMessage, opts: IErrorHandlerOpts = {}) {
    return (err) => {
      let toastOpts = {duration: 1500, position: "bottom"};
      if (opts.shouldDismissLoading === undefined) opts.shouldDismissLoading = true;
      if (opts.shouldPopView === undefined) opts.shouldPopView = false;

      if (parseInt(err.status) === 401) {
            message = `Sorry, there was an error validating your credentials. Please try signing out and then signing back in.`;
            toastOpts.duration = 5000;
      } else {
        switch(errorType) {
          case this.ERROR_TYPES.API:
          case this.ERROR_TYPES.UNHANDLED_EXCEPTION:
            message = message;
            break;
          case this.ERROR_TYPES.PLUGIN[errorType]:
            message = this.ERROR_MESSAGES[errorType];
          default: 
            message = message;
        }
      }

      

      this.presentToast(opts.shouldPopView, message, toastOpts.position, toastOpts.duration);
      opts.shouldDismissLoading && this.dismissLoading();

      console.log("err: ", err);

      if (ENV.development) {
        let url = err.url !== undefined ? err.url === null ? "ERR_CONNECTION_REFUSED" : err.url : "No url given"; 
        const title = `Error type: ${errorType}`;
        const subTitle = `Route: ${url}`;
        this.presentErrorAlert(title, subTitle, err);
      } else {
          // http analytics call here
      }
    }
  }

  presentErrorAlert(title = "ERROR!", subTitle = "ERROR!", message = "No stack trace given.") {
    const alert = this.alertCtrl.create({title, subTitle, message});
    alert.present();
  }



  // app-wide toast
  public presentToast(shouldPopView: Boolean, message = AppViewData.getToast().defaultErrorMessage, position = AppViewData.getToast().defaultToastPosition, duration = AppViewData.getToast().defaultToastDuration) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: duration || 4000,
      position: position || "bottom"
    });

    toast.onDidDismiss(() => {
      if (shouldPopView) {
        //this.navCtrl.pop();
      } else {
        // do nothing
      }
    });

    toast.present();
  }

  // app-wide popup
  public showPopup(args) {
    const alert = this.alertCtrl.create(args);
    alert.present();
  }

  // app-wide loading
  public presentLoading(message = AppViewData.getLoading().default) {
    this.loading = this.loadingCtrl.create({
      content: message,
    });
    this.loading.present();

    
    this.loading.onDidDismiss(() => {
      this.loading = null;
    });
    
  }

  public dismissLoading(message = null) {
    if (message) {
      setTimeout(() => {
        this.loading.dismiss();
      }, 1000);

      setTimeout(() => {
        this.loading.data.content = message;
        this.loading.data.spinner = 'hide';
      }, 400);
    } else {
      this.loading.dismiss();
    }
  }

}
