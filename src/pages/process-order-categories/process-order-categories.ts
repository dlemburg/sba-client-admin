import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Utils } from '../../utils/utils';

@IonicPage()
@Component({
  selector: 'page-process-order-categories',
  templateUrl: 'process-order-categories.html'
})

export class ProcessOrderCategoriesPage {
  categories: any;
  categoryOid: number;

 constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    this.categories = Utils.getImgs(this.navParams.data.categories);
  }
  
  dismissWithData(category) {
    this.viewCtrl.dismiss({
      oid: category.oid,
      name: category.name,
      img: category.img
    });
  }

  dismiss() {
    this.viewCtrl.dismiss({
      oid: null,
      name: null
    });
  }
}
