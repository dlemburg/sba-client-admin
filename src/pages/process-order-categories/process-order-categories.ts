import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { INameAndOid } from '../../models/models';
import { AppData } from '../../global/app-data';


@IonicPage()
@Component({
  selector: 'page-process-order-categories',
  templateUrl: 'process-order-categories.html'
})

export class ProcessOrderCategoriesPage {
  categories: any;
  categoryOid: number;

 constructor(public viewCtrl: ViewController, public navCtrl: NavController, public appData: AppData, public navParams: NavParams) {}

  ionViewDidLoad() {
    this.categories = this.navParams.data.categories;

    this.categories.forEach((x) => {
      x.imgSrc = this.appData.getDisplayImgSrc(x.img);
    });
  }
  
  dismissWithData(category) {
    this.viewCtrl.dismiss({
      oid: category.oid,
      name: category.name,
      img: category.imgSrc
    });
  }

  dismiss() {
    this.viewCtrl.dismiss({
      oid: null,
      name: null
    });
  }



}
