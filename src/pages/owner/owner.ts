import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { Authentication } from '../../global/authentication';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { API, ROUTES } from '../../global/api';
import { CONST_PASSWORD_TYPES } from '../../global/global';
import { ICompanyDetails } from '../../models/models';

@IonicPage()
@Component({
  selector: 'page-owner',
  templateUrl: 'owner.html'
})
export class OwnerPage extends BaseViewController {
  addPages: Array<any> = [];
  pages: Array<any> = [
    {name: 'Reward - All', img: 'img/rewards_all.jpeg', addComponent: 'AddRewardPage', editComponent: 'EditRewardPage' },
    {name: 'Reward - One', img: 'img/rewards_individual.jpeg', addComponent: 'AddRewardIndividualPage', editComponent: 'EditRewardIndividualPage'},
    {name: 'Categories', img: null, type: 'Categories', addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'},
    {name: 'Products', img: 'img/products.jpeg', addComponent: 'AddProductPage', editComponent: 'EditProductPage'},
    {name: 'Sizes', type: 'Sizes', img: null, addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'},
  ];
  selectedPage: any = null;
  settings:  Array<any> =  [
    {name: 'App Customizations and Settings', img: 'img/app-settings.jpeg', component: 'AppCustomizationsPage' },
    {name: 'App Images', img: 'img/app-images.jpeg', component: 'AppImagesPage' },
    {name: 'Admin Passwords', img: 'img/admin-passwords.jpeg', component: 'EditPasswordsPage', type: CONST_PASSWORD_TYPES.ADMIN },
    {name: 'Owner Passwords', img: 'img/owner-passwords.jpg', component: 'EditPasswordsPage', type: CONST_PASSWORD_TYPES.OWNER },
  ];
  category: string = null;
  auth: AuthUserInfo;
  initHasRun: boolean = false;
  companyDetails: ICompanyDetails = {};

constructor(
  public navCtrl: NavController, 
  public navParams: NavParams, 
  public API: API, 
  public authentication: Authentication, 
  public alertCtrl: AlertController, 
  public toastCtrl: ToastController, 
  public loadingCtrl: LoadingController, 
  public viewCtrl: ViewController) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.category = 'settings';
    this.category = 'add-edit';  // init segment
    this.getAppCustomizationsAndSettingsForOwnerPage();
    
  }

  ionViewDidEnter() {
    this.selectedPage = null;
    
    if (this.initHasRun) this.getAppCustomizationsAndSettingsForOwnerPage();
    else this.initHasRun = true;
  }

  getAppCustomizationsAndSettingsForOwnerPage() {
    this.pages = this.setDefaultPages();
    this.settings = this.setDefaultSettings();

    this.presentLoading();
    this.API.stack(ROUTES.getAppCustomizationsAndSettingsForOwnerPage + `/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.companyDetails = response.data.companyDetails;
          this.pages = this.concatConditionalPages(this.pages);
          this.dismissLoading();
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  // prevents doubles
  setDefaultPages() {
    return [
      {name: 'Reward - All', img: 'img/rewards_all.jpeg', addComponent: 'AddRewardPage', editComponent: 'EditRewardPage' },
      {name: 'Reward - One', img: 'img/rewards_individual.jpeg', addComponent: 'AddRewardIndividualPage', editComponent: 'EditRewardIndividualPage'},
      {name: 'Categories', img: null, type: 'Categories', addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'},
      {name: 'Products', img: 'img/products.jpeg', addComponent: 'AddProductPage', editComponent: 'EditProductPage'},
      {name: 'Sizes', type: 'Sizes', img: null, addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'},
    ];
  }

  setDefaultSettings() {
    return [
      {name: 'App Customizations and Settings', img: 'img/app-settings.jpeg', component: 'AppCustomizationsPage' },
      {name: 'App Images', img: 'img/app-images.jpeg', component: 'AppImagesPage' },
      {name: 'Admin Passwords', img: 'img/admin-passwords.jpeg', component: 'EditPasswordsPage', type: CONST_PASSWORD_TYPES.ADMIN },
      {name: 'Owner Passwords', img: 'img/owner-passwords.jpg', component: 'EditPasswordsPage', type: CONST_PASSWORD_TYPES.OWNER },
    ];
  }
  concatConditionalPages(pages) {
    if (this.companyDetails.hasVariety) {
      pages = [...pages, {name: 'Variety', img: 'img/variety.jpeg', addComponent: 'AddDairyVarietySweetenerPage', editComponent: 'EditDairyVarietySweetenerPage', type: "Variety"}];
    }

    if (this.companyDetails.hasDairy) {
      pages = [...pages, {name: 'Dairy', img: 'img/dairy.jpeg', addComponent: 'AddDairyPage', editComponent: 'EditDairyPage', type: "Dairy"}];
    }

    if (this.companyDetails.hasFlavors) {
      pages = [...pages, {name: 'Flavors', img: 'img/flavors.jpg', addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage', type: "Flavors"}];
    }

    if (this.companyDetails.hasSweetener) {
      pages = [...pages, {name: 'Sweetener', img: 'img/sweetener.jpg', addComponent: 'AddDairyVarietySweetenerPage', editComponent: 'EditDairyVarietySweetenerPage', type: "Sweetener"}];
    }

    if (this.companyDetails.hasAddons) {
      pages = [...pages, {name: 'Addons', img: 'img/addons.jpg', addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage', type: "Addons"}];
    }

    pages = [...pages, {name: 'Locations', img: 'img/locations.jpeg', addComponent: 'AddLocationPage', editComponent: 'EditLocationPage'}];
    pages = [...pages, {name: 'Keywords', type: 'Keywords', img: 'img/keywords.jpeg', addComponent: 'AddGeneralPage', editComponent: 'EditGeneralPage'}];

    return pages;
  }

  nav(component, theType) {
    this.navCtrl.push(component, {type: theType ? theType : null});
  }
}
