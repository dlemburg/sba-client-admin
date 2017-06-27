import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { AppData } from '../../global/app-data';

@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html'
})
export class CategoriesPage extends BaseViewController {
  categories: Array<{img: string, imgSrc: string, title: string, oid: number}> = [];
  auth: AuthUserInfo;

  constructor(public navCtrl: NavController, public navParams: NavParams, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.auth = this.authentication.getCurrentUser();
    this.API.stack(ROUTES.getCategories + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.categories = response.data.categories;
              this.categories.forEach((x) => {
                x.imgSrc = this.appData.getDisplayImgSrc(x.img);
              });
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  navProductsList(category): void {
    this.navCtrl.push('ProductsListPage', {category})
  }
}