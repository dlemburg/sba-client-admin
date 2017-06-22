import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Validation } from '../../global/validation';
import { AsyncValidation } from '../../global/async-validation.service';
import { ILkp } from '../../models/models';
import { API, ROUTES } from '../../global/api.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
import { AuthUserInfo, INameOidCompanyOid, INameAndOid } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-edit-product',
  templateUrl: 'edit-product.html'
})
export class EditProductPage extends BaseViewController {
  productOid: number;
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
  values: Array<INameAndOid> = [];
  originalValue: string = null;
  editOid: number = null;

  sizesAndPricesType: string = null;
  sizesAndPricesTypesArr: Array<string> = ["Fixed Price", "Sizes"];

  COMPANY_DETAILS = {
    HAS_DAIRY: false,
    HAS_SWEETENER: false,
    HAS_VARIETY: false,
    HAS_ADDONS: false,
    HAS_FLAVORS: false
  };

  SIZES_AND_PRICES_TYPE = {
    FIXED_PRICE: "Fixed Price",
    SIZES: "Sizes"
  };


constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

      this.myForm = this.formBuilder.group({
        name: ['', Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
        img: ['', Validators.required],
        caloriesLow: ['', Validators.compose([Validation.aboveZero, Validation.test("numbersOnly")])],
        caloriesHigh: ['', Validators.compose([Validation.aboveZero, Validation.test("numbersOnly")])],
        description: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
        categoryOid: ['', Validators.required],
        flavors: [ [] ],
        addons: [ [] ],
        dairy: [ [] ],
        variety: [ [] ],
        sweetener: [ [] ],
        sizesAndPrices: this.formBuilder.array([]),   // init to empty  (could also build the group here if wanted)
        fixedPrice: ['', Validation.test("numbersOnly")],
        numberOfFreeAddonsUntilCharged: [0, Validation.test("numbersOnly")],
        addonsPriceAboveLimit: [0.00, Validators.compose([ Validators.required, Validation.money]) ],
        lkpNutritionOid: ['', Validators.required],
        lkpSeasonOid: ['', Validators.required],
        keywords: ['', Validators.required],
        hasDefaultProductHealthWarning: [false]
      }, {validator: Validation.isLowerMustBeHigher('caloriesLow', 'caloriesHigh')});
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();

    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
      .subscribe(
          (response) => {

            this.COMPANY_DETAILS.HAS_DAIRY = response.data.companyDetails.hasDairy;
            this.COMPANY_DETAILS.HAS_SWEETENER = response.data.companyDetails.hasSweetener;
            this.COMPANY_DETAILS.HAS_VARIETY = response.data.companyDetails.hasVariety;
            this.COMPANY_DETAILS.HAS_ADDONS = response.data.companyDetails.hasAddons;
            this.COMPANY_DETAILS.HAS_FLAVORS = response.data.companyDetails.hasFlavors;

          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });

    // already had top call made; doesn't need to be async
    this.API.stack(ROUTES.getProductsNameAndOid + `/${this.auth.companyOid}`, 'GET')
      .subscribe(
          (response) => {
            console.log('response.data: ', response.data);
            this.values = response.data.products;

            this.getAllProductOptionsAPI();
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }

  getAllProductOptionsAPI() {
    this.API.stack(ROUTES.getAllProductOptions + `/${this.auth.companyOid}`, "GET")
      .subscribe(
          (response) => {
            let { categories, flavors, addons, dairy, variety, sweetener, sizes, keywords, nutritions, seasons } = response.data.productInfo;
            
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
            
            console.log('response.data: ', response.data);
            this.dismissLoading(); // this one is needed first, so just dismiss here


          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }

  editValueChange() {
    if (this.editOid) {
      this.presentLoading();
      this.API.stack(ROUTES.getProductToEdit + `/${this.auth.companyOid}/${this.editOid}`, "GET")
        .subscribe(
            (response) => {
              console.log('response.data.product: ', response.data.product);
              let product = response.data.product;
              this.originalValue = product.name;

              this.myForm.patchValue({
                name: product.name,
                img: product.img, 
                caloriesLow: product.caloriesLow,
                caloriesHigh: product.caloriesHigh,
                pointsValue: product.pointsValue,
                description: product.description,
                categoryOid: product.categoryOid,
                flavors: product.flavors,
                dairy: product.dairy,
                variety: product.variety,
                sweetener: product.sweetener,
                sizesAndPrices: product.sizesAndPrices,
                fixedPrice: product.fixedPrice,                           
                addons: product.addons,                            
                numberOfFreeAddonsUntilCharged: product.numberOfFreeAddonsUntilCharged,
                addonsPriceAboveLimit: product.addonsPriceAboveLimit,
                lkpNutritionOid: product.lkpNutritionOid,          
                lkpSeasonOid: product.lkpSeasonOid,                 
                keywords: product.keywords,
                hasDefaultProductHealthWarning: product.hasDefaultProductHealthWarning
              });

              // init all values
              this.onSizeChange(product.sizesAndPrices);   // build formArray
              if (product.fixedPrice) this.sizesAndPricesType = this.SIZES_AND_PRICES_TYPE.FIXED_PRICE;

              this.dismissLoading();
            
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
    }
  }


// [(ngModel)]="selectedSizes" [ngModelOptions]="{standalone: true}"
  getSelectedSizes(sizesAndPrices): Array<any> {
    let arr = [];
    this.sizes.forEach( (x) => {
      sizesAndPrices.forEach( (y) => {
         x.name === y.name ? arr.push({oid: x.oid, name: x.name }) : null;
      });
    });

    return arr;
  }

  resetFormArray(arr) {
    if (arr && arr.length) {
      for (let i = 0; i < arr.length; i++) {
        arr.removeAt(i);
      }
      while (arr.length) {
        arr.removeAt(arr.length - 1);
      }
    }
  }

  onSizesAndPricesTypeChange() {
    
  }

  onSizeChange(sizes: Array<any>): void {
    let arr = this.myForm.controls.sizesAndPrices;

    // resets formArray. best way to do it so far
    this.resetFormArray(arr);

    // build form array
    sizes.forEach((x, index) => {
      arr.push(this.formBuilder.group({
        name: x.name,
        oid: x.oid, 
        price: [x.price || null, Validators.compose([Validators.required, Validation.money])]
      }))
    });
  }

  checkIfAllSelected(control: string): void {
    let arr = this.myForm.controls[control].value;

    const isAllChecked = (x) => {
      return x.toLowerCase() === "all";
    }
      if (arr.find(isAllChecked)) {
        this.myForm.controls[control].patchValue({[control]: this[control]});
      }
  }

  navExplanations(): void {
    this.presentModal('ExplanationsPage', {type: "Rewards"}, {enableBackdropDismiss: true, showBackdrop: true});
  }


  remove(): void {
    this.presentLoading(AppDataService.loading.removing);
    this.API.stack(ROUTES.removeProduct + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(AppDataService.loading.removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        }, (err) => {
          const shouldPopView = true;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

  submit(myForm, isValid: boolean): void {

     // validate size -- this is a hack- should be cleaned up later
    if (myForm.fixedPrice && myForm.sizesAndPrices.length) {
      this.presentToast(false, {message: "Looks like you have values for fixed price and multiple sizes.", position: "middle", duration: 1000});
      return;
    }

    /*** Package for submit ***/
    this.presentLoading(AppDataService.loading.saving);

    // account for 'all' selected
    /*
    AppDataService.checkAll().forEach((x) => {
      this.checkIfAllSelected(x);
    });
    */

    const toData: ToDataEditProduct = {toData: myForm, companyOid: this.auth.companyOid, editOid: this.editOid};
    
    console.log("toData: ", toData);
    
    this.API.stack(ROUTES.editProduct, "POST", toData)
      .subscribe(
          (response) => {
            console.log('response: ', response);
            this.dismissLoading(AppDataService.loading.saved);
            this.myForm.reset();
            this.editOid = null;
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }
}

interface ToDataEditProduct {
  toData: any;
  companyOid: number;
  editOid: number
}