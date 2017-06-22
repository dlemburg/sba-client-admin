import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { INameAndOid } from '../../models/models';


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
    this.categories = this.navParams.data.categories;
  }
  
  selectCategoryAndDismiss(category: INameAndOid) {
    this.viewCtrl.dismiss({
      oid: category.oid,
      name: category.name
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }



}
