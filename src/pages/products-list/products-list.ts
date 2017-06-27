import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { INameImg, AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { AppData } from '../../global/app-data';

@IonicPage()
@Component({
  selector: 'page-products-list',
  templateUrl: 'products-list.html'
})
export class ProductsListPage extends BaseViewController {
  auth: AuthUserInfo;
  products: Array<any> = [];
  categoryName: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    this.presentLoading();
    let categoryOid = this.navParams.data.category.oid;
    this.categoryName = this.navParams.data.category.name;

    this.auth = this.authentication.getCurrentUser();
    this.API.stack(ROUTES.getProducts + `/${this.auth.companyOid}/${categoryOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              console.log('response.data: ' , response.data);
              this.products = response.data.products;

              this.products.forEach((x) => {
                x.imgSrc = this.appData.getDisplayImgSrc(x.img);
              });
            },  (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  navToProductDetails(product): void {
    this.navCtrl.push('ProductsDetailsPage', {product})
  }
}
