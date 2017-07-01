import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { INameOidCompanyOid, ILkp,  IPopup, AuthUserInfo, ICompanyDetails  } from '../../models/models';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS } from '../../global/global';


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
  img: string = null;
  imgSrc: string = null;
  failedUploadImgAttempts: number = 0;

  companyDetails: ICompanyDetails = {};

  SIZES_AND_PRICES_TYPE = {
    FIXED_PRICE: "Fixed Price",
    SIZES: "Sizes"
  };

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
    super(alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
      img: [null],
      caloriesLow: ['', Validators.compose([Validation.test("isAboveZero"), Validation.test("isNumbersOnly")])],
      caloriesHigh: ['', Validators.compose([Validation.test("isAboveZero"), Validation.test("isNumbersOnly")])],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
      categoryOid: ['', Validators.required],
      flavors: [ [] ],
      addons: [ [] ],
      dairy: [ [] ],
      variety: [ [] ],
      sweetener: [ [] ],
      sizesAndPrices: this.formBuilder.array([]),   // init to empty  (could also build the group here if wanted)
      fixedPrice: ['', Validation.test("isMoney")],
      numberOfFreeAddonsUntilCharged: [0, Validation.test("isNumbersOnly")],
      addonsPriceAboveLimit: [0.00, Validators.compose([ Validators.required, Validation.test("isMoney")]) ],
      lkpNutritionOid: ['', Validators.required],
      lkpSeasonOid: ['', Validators.required],
      keywords: ['', Validators.required],
      hasDefaultProductHealthWarning: [false]
    }, {validator: Validators.compose([Validation.isLowerMustBeHigher('caloriesLow', 'caloriesHigh')])});

    this.auth = this.authentication.getCurrentUser();
  }

  ionViewDidLoad() {
    this.presentLoading();

    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
      .subscribe(
          (response) => {
            this.companyDetails = response.data.companyDetails;

          }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));
    
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
            
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  onSizesAndPricesTypeChange() {}
  
  navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "Products"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
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
          price: [null, Validators.compose([Validators.required, Validation.test("isMoney")])]
        }))
      })
  }

  getImgCordova() {
    this.presentLoading("Retrieving...");
    const options: CameraOptions = {

      // used lower quality for speed
      quality: 100,
      targetHeight: 238,
      targetWidth: 423,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: 2
    }

    this.platform.ready().then(() => {
      this.camera.getPicture(options).then((imageData) => {
        console.log("imageData, ", imageData);

        this.imgSrc = imageData;
        this.img = CONST_APP_IMGS[15] + this.myForm.controls["name"].value + `$` + this.auth.companyOid;
        this.myForm.patchValue({
          img: this.img
        });
        this.dismissLoading();
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(): Promise<any> {
    this.presentLoading(AppViewData.getLoading().savingImg);

    return new Promise((resolve, reject) => {
        let options: FileUploadOptions = {
          fileKey: 'upload-img-no-callback', 
          fileName: this.img,        
          headers: {}
        };
        const fileTransfer: TransferObject = this.transfer.create();

        fileTransfer.upload(this.imgSrc, ROUTES.uploadImgNoCallback, options).then((data) => {
          console.log("uploaded successfully... ");
          this.dismissLoading();
          resolve();
        })
        .catch((err) => {
            let message = "";
            let shouldPopView = false;
            this.failedUploadImgAttempts++;
            this.dismissLoading();

            if (this.failedUploadImgAttempts === 1) {
               message = AppViewData.getToast().imgUploadErrorMessageFirstAttempt;
               reject(err);
            } else {
              message = AppViewData.getToast().imgUploadErrorMessageSecondAttempt;
              resolve();
            }
            this.presentToast(shouldPopView, message);
        });
    });
  }


  submit(myForm, isValid: boolean): void {

    // validate size -- this is a hack- should be cleaned up later
    if (myForm.fixedPrice && myForm.sizesAndPrices.length) {
      this.presentToast(false, "Looks like you have values for fixed price and multiple sizes.");
      return;
    }

    /*** Package for submit ***/
    const toData: ToDataSaveProduct = {toData: myForm, companyOid: this.auth.companyOid, isEdit: false};
    this.platform.ready().then(() => {
      this.uploadImg().then(() => {
        this.presentLoading(AppViewData.getLoading().saving);
        this.API.stack(ROUTES.saveProduct, "POST", toData)
          .subscribe(
              (response) => {
                this.dismissLoading(AppViewData.getLoading().saved);
                this.myForm.reset();
                this.img = null;
                this.imgSrc = null;
                this.failedUploadImgAttempts = 0;
              }, this.errorHandler(this.ERROR_TYPES.API));
      });
    });
  }
}
interface ToDataSaveProduct {
  toData: any;
  companyOid: number;
  isEdit: boolean;
}