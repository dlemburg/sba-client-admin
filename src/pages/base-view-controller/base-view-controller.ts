import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { Utils } from '../../global/utils/utils';
import { Authentication } from '../../global/authentication';

import { NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { IPopup } from '../../models/models';


@Component({
  selector: 'page-base-view-controller',
  templateUrl: 'base-view-controller.html'
})
export class BaseViewController {
  public loading: any;
  constructor(public appData: AppData, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController ) {
  }

  // app-wide error-handler
  public errorHandler(err, shouldPopView = false, isLoading = true) {
    this.presentToast(shouldPopView);
    isLoading && this.dismissLoading();
  }


  // app-wide toast
  public presentToast(shouldPopView: Boolean, args = {message: this.appData.getToast().defaultErrorMessage, position: this.appData.getToast().defaultToastPosition, duration: this.appData.getToast().defaultToastDuration}) {
    let toast = this.toastCtrl.create({
      message: args.message,
      duration: args.duration,
      position: args.position
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

  // modal
  presentModal(page: Component, params: any = {}, opts: any = {}) {
    let modal = this.modalCtrl.create(page, params, opts)
    modal.present();
  }
  

  // app-wide popup
  public showPopup(args: IPopup) {
    const alert = this.alertCtrl.create(args);
    alert.present();
  }

  
  // app-wide loading
  public presentLoading(message = this.appData.getLoading().default) {
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
      }, 800);

      setTimeout(() => {
        this.loading.data.content = message;
        this.loading.data.spinner = 'hide';
      }, 500);
    } else {
      this.loading.dismiss();
    }
  }

}
