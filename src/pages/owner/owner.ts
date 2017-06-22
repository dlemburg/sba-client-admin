import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { Authentication } from '../../global/authentication.service';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { API, ROUTES } from '../../global/api.service';
import * as global from '../../global/global';

@IonicPage()
@Component({
  selector: 'page-owner',
  templateUrl: 'owner.html'
})
export class OwnerPage extends BaseViewController {
  addPages: Array<any> = [];
  pages: Array<any> = [
    {name: 'Products', img: 'img/products.jpeg', addComponent: 'AddProductPage', editComponent: 'EditProductPage'},
    {name: 'Categories', img: null, type: 'Categories', addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'},
    {name: 'Reward: All', img: null, addComponent: 'AddRewardPage', editComponent: 'EditRewardPage' },
    {name: 'Reward: Individual', img: null, addComponent: 'AddRewardIndividualPage', editComponent: 'EditRewardIndividualPage'},
    {name: 'Sizes', type: 'Sizes', img: null, addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'},
    {name: 'Keywords', type: 'Keywords', img: 'img/keywords.jpeg', addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'},
    {name: 'Locations', img: 'img/locations.jpeg', addComponent: 'AddLocationPage', editComponent: 'EditLocationPage'},
  ];
  selectedPage: any = null;
  settings:  Array<any> =  [
    {name: 'App Customizations and Settings', img: 'img/app-settings.jpeg', component: 'AppCustomizationsPage' },
    {name: 'App Images', img: 'img/app-images.jpeg', component: 'AppImagesPage' },
    {name: 'Admin Passwords', img: 'img/admin-passwords.jpeg', component: 'EditPasswordsPage', type: global.PASSWORD_TYPES.ADMIN },
    {name: 'Owner Passwords', img: 'img/owner-passwords.jpg', component: 'EditPasswordsPage', type: global.PASSWORD_TYPES.OWNER },
  ];
  category: string = null;
  auth: AuthUserInfo

  COMPANY_DETAILS = global.COMPANY_DETAILS;

constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public viewCtrl: ViewController) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

  }

  ionViewDidLoad() {
    this.presentLoading();
    this.auth = this.authentication.getCurrentUser();
    this.category = 'settings';
    this.category = 'add-edit';  // init segment

    this.API.stack(ROUTES.getAppCustomizationsAndSettingsForOwnerPage + `/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.COMPANY_DETAILS.HAS_DAIRY = response.data.companyDetails.hasDairy;
          this.COMPANY_DETAILS.HAS_SWEETENER = response.data.companyDetails.hasSweetener;
          this.COMPANY_DETAILS.HAS_VARIETY = response.data.companyDetails.hasVariety;
          this.COMPANY_DETAILS.HAS_ADDONS = response.data.companyDetails.hasAddons;
          this.COMPANY_DETAILS.HAS_FLAVORS = response.data.companyDetails.hasFlavors;

          this.pages = this.concatConditionalPages(this.pages);
          this.dismissLoading();


        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });

  }

  ionViewDidEnter() {
    this.selectedPage = null;
  }

  concatConditionalPages(pages) {
    if (this.COMPANY_DETAILS.HAS_DAIRY) {
      pages = [...pages, {name: 'Dairy', img: 'img/dairy.jpeg', addComponent: 'AddDairyPage', editComponent: 'EditDairyPage', type: "Dairy"}];
    }

    if (this.COMPANY_DETAILS.HAS_VARIETY) {
      pages = [...pages, {name: 'Variety', img: 'img/variety.jpeg', addComponent: 'AddDairyVarietySweetenerPage', editComponent: 'EditDairyVarietySweetenerPage', type: "Variety"}];
    }

    if (this.COMPANY_DETAILS.HAS_SWEETENER) {
      pages = [...pages, {name: 'Sweetener', img: null, addComponent: 'AddDairyVarietySweetenerPage', editComponent: 'EditDairyVarietySweetenerPage', type: "Sweetener"}];
    }

    if (this.COMPANY_DETAILS.HAS_FLAVORS) {
      pages = [...pages, {name: 'Flavors', img: null, addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage', type: "Flavors"}];
    }

    if (this.COMPANY_DETAILS.HAS_ADDONS) {
      pages = [...pages, {name: 'Addons', img: null, addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage', type: "Addons"}];
    }

    return pages;
  }

  nav(component, type) {
    this.navCtrl.push(component, {type: type ? type : null});
  }

}
