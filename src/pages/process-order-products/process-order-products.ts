import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';

@IonicPage()
@Component({
  selector: 'page-process-order-products',
  templateUrl: 'process-order-products.html'
})
export class ProcessOrderProductsPage {
  products: any;

 constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    this.products = this.navParams.data.products;

    this.products.forEach((x) => {
      x.imgSrc = AppViewData.getDisplayImgSrc(x.img);
    });

  }
  
  dismissWithData(product) {
    this.viewCtrl.dismiss({
      oid: product.oid, 
      name: product.name,
      img: product.img
    });
  }

  dismiss() {
    this.viewCtrl.dismiss({
      oid: null,
      name: null
    });
  }

}