import { Component } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { ILkp } from '../../models/models';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, INameOidCompanyOid, INameAndOid, ICompanyDetails } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';

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
  companyDetails: ICompanyDetails = {};

  SIZES_AND_PRICES_TYPE = {
    FIXED_PRICE: "Fixed Price",
    SIZES: "Sizes"
  };

  imgSrc: string = null;
  img: string = null;
  oldImg: string = null;
  imgChanged: boolean = false;
  failedUploadImgAttempts = 0;
  ImageUtility: ImageUtility;

constructor(
  public navCtrl: NavController, 
  public navParams: NavParams, 
  public API: API, 
  public authentication: Authentication, 
  public modalCtrl: ModalController, 
  public alertCtrl: AlertController, 
  public toastCtrl: ToastController, 
  public loadingCtrl: LoadingController, 
  private formBuilder: FormBuilder,
  private camera: Camera, 
  private transfer: Transfer, 
  private file: File,
  private platform: Platform) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

      this.myForm = this.formBuilder.group({
        name: ['', Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
        img: ['', Validators.required],
        caloriesLow: ['', Validators.compose([Validation.test('isAboveZero'), Validation.test("isNumbersOnly")])],
        caloriesHigh: ['', Validators.compose([Validation.test("isAboveZero"), Validation.test("isNumbersOnly")])],
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
        addonsPriceAboveLimit: [0.00, Validators.compose([ Validators.required, Validation.test("money")]) ],
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
            this.companyDetails = response.data.companyDetails;
          }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));

    // already had top call made; doesn't need to be async
    this.API.stack(ROUTES.getProductsNameAndOid + `/${this.auth.companyOid}`, 'GET')
      .subscribe(
          (response) => {
            console.log('response.data: ', response.data);
            this.values = response.data.products;
            this.getAllProductOptionsAPI();
          }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));
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
          }, this.errorHandler(this.ERROR_TYPES.API));
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
              this.imgSrc = AppViewData.getDisplayImgSrc(product.img);
              this.oldImg = product.img;
              this.onSizeChange(product.sizesAndPrices);   // build formArray
              if (product.fixedPrice) this.sizesAndPricesType = this.SIZES_AND_PRICES_TYPE.FIXED_PRICE;

              this.dismissLoading();
            }, this.errorHandler(this.ERROR_TYPES.API));
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
        price: [x.price || null, Validators.compose([Validators.required, Validation.test("isMoney")])]
      }))
    });
  }

   navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "Products"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
  }


  remove(): void {
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeProduct + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().removed);
          setTimeout(() => {
            this.navCtrl.pop();
          }, 1000);
          console.log('response: ', response); 
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.ImageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.ImageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        img: Utils.generateImgName({appImgIndex: 14, name: this.myForm.controls["name"].value, companyOid: this.auth.companyOid})
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(myForm): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ImageUtility.uploadImg('upload-img-no-callback', myForm.img, this.imgSrc, ROUTES.uploadImgNoCallback).then((data) => {
        resolve();
      })
      .catch((err) => {
        console.log("catch from upload img");
        reject(err);
      })
    })
  }

  submit(myForm, isValid: boolean): void {

    // validate size -- this is a hack- should be cleaned up later
    if (myForm.fixedPrice && myForm.sizesAndPrices.length) {
      this.presentToast(false, "Looks like you have values for fixed price and multiple sizes.");
      return;
    }
    this.presentLoading(AppViewData.getLoading().saving);


    if (myForm.img) {
      this.uploadImg(myForm).then(() => {
        this.finishSubmit(myForm);
      }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD));
    } else this.finishSubmit(myForm);
  }

  finishSubmit(myForm) {
    const toData: ToDataEditProduct = {toData: myForm, companyOid: this.auth.companyOid, editOid: this.editOid};

    this.API.stack(ROUTES.editProduct, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
              setTimeout(() => {
              this.navCtrl.pop();
            }, 1000);  
            console.log('response: ', response);
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}

interface ToDataEditProduct {
  toData: any;
  companyOid: number;
  editOid: number
}