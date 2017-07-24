import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { Utils } from '../../utils/utils';
import { Authentication } from '../../global/authentication';
import { IPurchaseItem, AuthUserInfo} from '../../models/models';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { AppViewData } from '../../global/app-data';

@IonicPage()
@Component({
  selector: 'page-products-details',
  templateUrl: 'products-details.html'
})
export class ProductsDetailsPage extends BaseViewController {
  productImgSrc: string = null;
  productDetails: any = {
    addonsToClient: [],
    flavorsToClient: [],
    sizesAndPrices: [],
    sweetenerToClient: [],
    varietyToClient: [],
    dairyToClient: []
  };
  quantities: Array<number> = Utils.getNumbersList(25);
  purchaseItem: IPurchaseItem = {
    selectedProduct: {oid: null, name: null, imgSrc: null},
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

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,     
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.productImg = this.navParams.data.product.img;
    this.productImgSrc = AppViewData.getDisplayImgSrc(this.navParams.data.product.img);
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
            },this.errorHandler(this.ERROR_TYPES.API));
  }
}
