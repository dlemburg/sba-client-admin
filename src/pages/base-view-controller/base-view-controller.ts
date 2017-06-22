import { Component } from '@angular/core';
import { RewardsDetailsPage } from '../rewards-details/rewards-details';
import { API, ROUTES } from '../../global/api.service';
import { UtilityService } from '../../global/utility.service';
import { IErrChecks, IReward, IPopup } from '../../models/models';
import { Authentication } from '../../global/authentication.service';
import { TabsPage } from "../tabs/tabs";
import { NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
import { ExplanationsPage } from '../explanations/explanations';

@Component({
  selector: 'page-base-view-controller',
  templateUrl: 'base-view-controller.html'
})
export class BaseViewController {
  public loading: any;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public API: API, 
              public authentication: Authentication,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController ) {
  }

  // app-wide error-handler
  public errorHandler(err, shouldPopView = false, shouldDismissLoading = true) {
    console.log("should pop: ", shouldPopView);
    console.log("error documented from Base-View-Controller: ", err);
    this.presentToast(shouldPopView);
    shouldDismissLoading ? this.dismissLoading() : null;
  }

  // app-wide toast
  public presentToast(shouldPopView: Boolean, args = {message: AppDataService.defaultErrorMessage, position: AppDataService.defaultToastPosition, duration: AppDataService.defaultToastDuration}) {
    let toast = this.toastCtrl.create({
      message: args.message,
      duration: args.duration,
      position: args.position
    });

    toast.onDidDismiss(() => {
      if (shouldPopView) {
        this.navCtrl.pop();
      } else {
        
      }
    });

    toast.present();
  }

  // right now, if i don't care about what happens onDismiss, i inherit from BaseViewController; if i do care about getting 
  // data back onDissmiss, i create the modal inline in the controller
  // in the future, i can refactor dismiss to be an observable, so i can inherit from this method and subscribe to observable
  // modal
  presentModal(page: Component, params: any = {}, opts: {showBackdrop: boolean, enableBackdropDismiss: boolean} = {showBackdrop: true, enableBackdropDismiss: true}) {
    let modal = this.modalCtrl.create(page, params, opts)
    modal.present();
  }


  // app-wide popup, no callbacks
  public showPopup(args: IPopup) {
    const alert = this.alertCtrl.create(args);
    alert.present();
  }

  
  // app-wide loading
  public presentLoading(message = AppDataService.loading.default) {
    this.loading = this.loadingCtrl.create({
      content: message,
      //dismissOnPageChange: true
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
      }, 500);
    } else this.loading.dismiss();

    //  this.loading.dismiss().catch(() => console.log('ERROR CATCH: LoadingController dismiss'));
  }

}
