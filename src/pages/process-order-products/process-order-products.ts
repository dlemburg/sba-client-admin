import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

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
  }
  
  selectProductAndDismiss(product) {
    this.viewCtrl.dismiss({oid: product.oid, name: product.name});
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
