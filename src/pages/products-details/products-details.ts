import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api.service';
import { UtilityService } from '../../global/utility.service';
import { Authentication } from '../../global/authentication.service';
import { IPurchaseItem, AuthUserInfo} from '../../models/models';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-products-details',
  templateUrl: 'products-details.html'
})
export class ProductsDetailsPage extends BaseViewController {
   productDetails: any = {
    addonsToClient: [],
    flavorsToClient: [],
    sizesAndPrices: [],
    sweetenerToClient: [],
    varietyToClient: [],
    dairyToClient: []
  };
  quantities: Array<number> = UtilityService.getNumbersList(25);
  purchaseItem: IPurchaseItem = {
    selectedProduct: {oid: null, name: null},
    sizeAndOrPrice: { oid: null, name: null, price: null},
    quantity: null,
    addons: [],
    flavors: [],
    dairy: [],
    variety: [],
    sweetener: []
  };
  auth: AuthUserInfo;
  productImg: string;
  productOid: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.productImg = this.navParams.data.product.img
    this.productOid = this.navParams.data.product.oid;
    this.presentLoading();

    this.API.stack(ROUTES.getProductDetails + `/${this.auth.companyOid}/${this.productOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              console.log('response.data: ' ,response.data);
              //debugger;
              this.productDetails = response.data.productDetails;

              
               if (!this.productDetails.sizesAndPrices.length && this.productDetails.fixedPrice) {
                this.purchaseItem.sizeAndOrPrice = {name: null, oid: null, price: this.productDetails.fixedPrice};
               }
            }, (err) => {
              const shouldPopView = true;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }
}
