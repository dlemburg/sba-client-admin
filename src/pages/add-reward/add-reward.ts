import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Validation } from '../../utils/validation-utils';
import { AppUtils } from '../../utils/app-utils';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS, CONST_DISCOUNT_RULE, CONST_DISCOUNT_TYPE, CONST_PROCESSING_TYPE } from '../../global/global';

@IonicPage()
@Component({
  selector: 'page-add-reward',
  templateUrl: 'add-reward.html'
})
export class AddRewardPage extends BaseViewController {
  currentDiscountType: string;
  currentDiscountRule: string;
  auth: AuthUserInfo;
  days: Array<string>;
  myForm: any;
  products: Array<any> = [];
  PROCESSING_TYPE = CONST_PROCESSING_TYPE;
  DISCOUNT_TYPE = CONST_DISCOUNT_TYPE;
  DISCOUNT_RULE = CONST_DISCOUNT_RULE;
  
  lkps: any = {
    discountType: [],
    discountRule: []
  }
  doCallGetProducts: boolean = true;
  isSubmitted: boolean;
  img: string = null;
  imgSrc: string = null;
  failedUploadImgAttempts: number = 0;
  
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
      description: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      exclusions: ['', Validators.compose([Validators.maxLength(200)])],
      processingType: [this.PROCESSING_TYPE.MANUAL],
      lkpDiscountTypeOid: [null],
      lkpDiscountRuleOid: [null],
      discountAmount: [null],
      productOid: [null],
      dateRuleDays: [null],
      dateRuleTimeStart: [null],
      dateRuleTimeEnd: [null],
      startDate: ['', Validators.required],
      expiryDate: ['', Validators.required ],
      type: ["rewards_all"],

    }, {validator: Validators.compose([Validation.isDiscountAmountInvalid('lkpDiscountTypeOid', 'discountAmount'), Validation.isInvalidDate('startDate', 'expiryDate'), Validation.isInvalidTime('dateRuleTimeStart', 'dateRuleTimeEnd')])});
  }


  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.days = AppUtils.getDays();
    this.presentLoading();

    // SUBSCRIBE TO FORM
    //this.myForm.valueChanges.subscribe(data => this.onChange(data, 'start'));    // all
    //this.myForm.get('dateRuleTimeEnd').valueChanges.subscribe(data => this.onChange(data, 'end'));    // all
    this.myForm.get('processingType').valueChanges.subscribe(data => this.onProcessingTypeChanged(data));


    // get lkps
    this.API.stack(ROUTES.getProcessingAndDiscountLkps, "GET")
        .subscribe(
            (response) => {
              let { discountType, discountRule } = response.data.processingAndDiscountLkps;
              this.lkps.discountType = discountType;
              this.lkps.discountRule = discountRule;

              this.dismissLoading();
              console.log('response.data: ', response.data);
              
            }, this.errorHandler(this.ERROR_TYPES.API));
  }

  navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "Rewards"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
  }


  getCurrentDiscountRule(event): string {
    let lkpObj = this.lkps.discountRule.find((x) => {
        return x.oid === event;
    });
    return lkpObj.value;
  }
 

  discountRuleChanged(event): void {
    this.currentDiscountRule = this.getCurrentDiscountRule(event);

    const conditions = this.doCallGetProducts && this.currentDiscountRule === this.DISCOUNT_RULE.PRODUCT;
    if (conditions) {
      this.API.stack(ROUTES.getProductsNameAndOid + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              this.doCallGetProducts = false;
              let {products} = response.data;            
              this.products = products;
              
              console.log('response.data: ' ,response.data);
            }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }

  discountTypeChanged(event): void {
    let obj = this.lkps.discountType.find((x) => {
        return x.oid === event;
    });
    this.currentDiscountType = obj.value;
    
    this.myForm.patchValue({discountAmount: null});
  }

  onProcessingTypeChanged(data): void {
    // changes validation/errors
    let formCtrls = ['discountType', 'discountRule', 'discountAmount', 'dateRuleDays', 'dateRuleTimeStart', 'dateRuleTimeEnd'];
    let newValue = null;

    this.myForm.patchValue({ 
        discountType: newValue,
        discountRule: newValue,
        discountAmount: newValue, 
        productOid: newValue,
        dateRuleDays: newValue,
        dateRuleTimeStart: newValue,
        dateRuleTimeEnd: newValue,
    });
    
    formCtrls.forEach((key, index) => {
      if (this.myForm.controls && this.myForm.controls[key]) {
        if (data === this.PROCESSING_TYPE.AUTOMATIC) {
           this.myForm.controls[key].setValidators([Validators.required]);
           this.myForm.controls[key].setErrors(null);
           this.myForm.controls[key].markAsUntouched();
           this.myForm.controls[key].markAsPristine();
        } else {
          this.myForm.controls[key].setValidators([]);
          this.myForm.controls[key].setErrors(null);
        }
      }
    });
  }

   // also triggers observable subscription
  onSetProcessingType(type): void {
    this.myForm.patchValue({ 
      processingType: type
    });
  }

  getImgCordova() {
    this.presentLoading("Retrieving...");
    const options: CameraOptions = {

      // used lower quality for speed
      quality: 100,
      targetHeight: 423,
      targetWidth: 238,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: 2
    }

    this.platform.ready().then(() => {
      this.camera.getPicture(options).then((imageData) => {
        console.log("imageData, ", imageData);

        this.imgSrc = imageData;
        this.img = CONST_APP_IMGS[16] + this.myForm.controls["name"].value + `$` + this.auth.companyOid;
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


  submit(myForm): void {    
    
    this.platform.ready().then(() => {
      this.uploadImg().then(() => {

        this.presentLoading(AppViewData.getLoading().saving);
        /*** package ***/
        this.myForm.patchValue({
          startDate: DateUtils.patchStartTime(myForm.startDate),
          expiryDate: DateUtils.patchEndTime(myForm.expiryDate)
        });
        if (myForm.dateRuleDays) {
          this.myForm.patchValue({
            dateRuleDays: myForm.dateRuleDays.join(","),  // convert to string
            dateRuleTimeStart: DateUtils.getHours(myForm.dateRuleTimeStart),
            dateRuleTimeEnd: DateUtils.getHours(myForm.dateRuleTimeEnd),
          });
        }
        const toData: ToDataSaveOrEditReward = {toData: myForm, companyOid: this.auth.companyOid, isEdit: false};

        this.API.stack(ROUTES.saveReward, "POST", toData)
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
interface ToDataSaveOrEditReward {
  toData: any;
  companyOid: number;
  isEdit: boolean;
}