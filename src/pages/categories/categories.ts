import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html'
})
export class CategoriesPage extends BaseViewController {
  categories: Array<{img: string, title: string, oid: number}> = [];
  auth: AuthUserInfo;

  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.auth = this.authentication.getCurrentUser();
    this.API.stack(ROUTES.getCategories + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.categories = response.data.categories;
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  navProductsList(category): void {
    this.navCtrl.push('ProductsListPage', {category})
  }
}