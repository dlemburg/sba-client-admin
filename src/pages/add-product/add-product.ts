import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { INameOidCompanyOid, ILkp,  IPopup, AuthUserInfo  } from '../../models/models';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-add-product',
  templateUrl: 'add-product.html'
})
export class AddProductPage extends BaseViewController {
  
  auth: AuthUserInfo;
  myForm: any;
  sizes: Array<INameOidCompanyOid> = [];
  categories: Array<INameOidCompanyOid> = [];
  flavors: Array<INameOidCompanyOid> = [];
  addons: Array<INameOidCompanyOid> = [];
  dairy: Array<INameOidCompanyOid> = [];
  variety: Array<INameOidCompanyOid> = [];
  sweetener: Array<INameOidCompanyOid> = [];
  nutritions: Array<ILkp> = [];
  seasons: Array<ILkp> = [];
  keywords: Array<INameOidCompanyOid> = [];
  selectedSizes: Array<INameOidCompanyOid> = [];
  count: number = 0;
  sizesAndPricesType: string = null;
  sizesAndPricesTypesArr: Array<string> = ["Fixed Price", "Sizes"];

  COMPANY_DETAILS = {
    HAS_DAIRY: false,
    HAS_SWEETENER: false,
    HAS_VARIETY: false,
    HAS_ADDONS: false,
    HAS_FLAVOR: false
  };
  SIZES_AND_PRICES_TYPE = {
    FIXED_PRICE: "Fixed Price",
    SIZES: "Sizes"
  };


  constructor(public navCtrl: NavController, public navParams: NavParams, public validation: Validation, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
      img: ['', Validators.required],
      caloriesLow: ['', Validators.compose([this.validation.test("isAboveZero"), this.validation.test("isNumbersOnly")])],
      caloriesHigh: ['', Validators.compose([this.validation.test("isAboveZero"), this.validation.test("isNumbersOnly")])],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
      categoryOid: ['', Validators.required],
      flavors: [ [] ],
      addons: [ [] ],
      dairy: [ [] ],
      variety: [ [] ],
      sweetener: [ [] ],
      sizesAndPrices: this.formBuilder.array([]),   // init to empty  (could also build the group here if wanted)
      fixedPrice: ['', this.validation.test("isMoney")],
      numberOfFreeAddonsUntilCharged: [0, this.validation.test("isNumbersOnly")],
      addonsPriceAboveLimit: [0.00, Validators.compose([ Validators.required, this.validation.test("isMoney")]) ],
      lkpNutritionOid: ['', Validators.required],
      lkpSeasonOid: ['', Validators.required],
      keywords: ['', Validators.required],
      hasDefaultProductHealthWarning: [false]
    }, {validator: Validators.compose([this.validation.isLowerMustBeHigher('caloriesLow', 'caloriesHigh')])});

    this.auth = this.authentication.getCurrentUser();
  }

  ionViewDidLoad() {
    this.presentLoading();

    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
      .subscribe(
          (response) => {

            this.COMPANY_DETAILS.HAS_DAIRY = response.data.companyDetails.hasDairy;
            this.COMPANY_DETAILS.HAS_SWEETENER = response.data.companyDetails.hasSweetener;
            this.COMPANY_DETAILS.HAS_VARIETY = response.data.companyDetails.hasVariety;
            this.COMPANY_DETAILS.HAS_ADDONS = response.data.companyDetails.hasAddons;
            this.COMPANY_DETAILS.HAS_FLAVOR = response.data.companyDetails.hasFlavors;
          //  this.COMPANY_DETAILS.DEFAULT_PRODUCT_HEALTH_WARNING = response.data.companyDetails.defaultProductHealthWarning;

          }, (err) => {
            const shouldPopView = false;
            const shouldDismiss = false;
            this.errorHandler.call(this, err, shouldPopView, shouldDismiss)
          });
    
    // doesn't need to be async
    this.API.stack(ROUTES.getAllProductOptions + `/${this.auth.companyOid}`, "GET")
      .subscribe(
          (response) => {
            console.log("response.data.productInfo: ", response.data.productInfo);
            let { categories, flavors, addons, dairy, variety, sweetener, sizes, keywords, nutritions, seasons } = response.data.productInfo;
            
            // not part of myForm
            this.categories = categories;
            this.flavors = flavors;
            this.addons = addons;
            this.dairy = dairy;
            this.variety = variety;
            this.sweetener = sweetener;
            this.sizes = sizes;
            this.keywords = keywords;
            this.nutritions = nutritions;
            this.seasons = seasons;

            this.dismissLoading();
            
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }

  onSizesAndPricesTypeChange() {


  }
  
  seeExplanations() {
    this.presentModal('ExplanationsPage', {type: "Products"}, {enableBackdropDismiss: true, showBackdrop: true});
  }


  onSizeChange(sizes: Array<any>): void {
    let arr = this.myForm.controls.sizesAndPrices;

    // 1.) resets form array. best way to do it so far
    if (arr && arr.length) {
      for (let i = 0; i < arr.length; i++) {
        arr.removeAt(i);
      }
      while (arr.length) {
        arr.removeAt(arr.length - 1);
      }
    }-
      // 2.) dynamically adds input for price:size
      sizes.forEach((x, index) => {
        console.log('x: ', x);
        arr.push(this.formBuilder.group({
          name: x.name,
          oid: x.oid,
          price: [null, Validators.compose([Validators.required, this.validation.test("isMoney")])]
        }))
      })
  }

  /*** take care of "all" here ***/
  checkIfAllSelected(control: string): void {
    let arr = this.myForm.controls[control].value;

    const isAllChecked = (x) => {
      return x.toLowerCase() === "all";
    }

    if (arr.length) {
      if (arr.find(isAllChecked)) {
        this.myForm.controls[control].patchValue({[control]: this[control]});
      }
    }
  }

  submit(myForm, isValid: boolean): void {

    // validate size -- this is a hack- should be cleaned up later
    if (myForm.fixedPrice && myForm.sizesAndPrices.length) {
      this.presentToast(false, {message: "Looks like you have values for fixed price and multiple sizes.", position: "middle", duration: 1000});
      return;
    }

    // account for 'all' selected
    /*
    AppDataService.checkAll().forEach((x) => {
      this.checkIfAllSelected(x);
    });
    */
    
    /*** Package for submit ***/
    this.presentLoading(this.appData.getLoading().saving);
    const toData: ToDataSaveProduct = {toData: myForm, companyOid: this.auth.companyOid, isEdit: false};

    console.log("toData: ", toData);

    this.API.stack(ROUTES.saveProduct, "POST", toData)
      .subscribe(
          (response) => {
            
            this.dismissLoading(this.appData.getLoading().saved);
            this.navCtrl.pop();
          },  (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }
}
interface ToDataSaveProduct {
  toData: any;
  companyOid: number;
  isEdit: boolean;
}