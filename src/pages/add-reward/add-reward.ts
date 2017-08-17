import { Component } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Validation } from '../../utils/validation-utils';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_DISCOUNT_RULE, CONST_DISCOUNT_TYPE, CONST_PROCESSING_TYPE } from '../../global/global';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';

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
  imageUtility: ImageUtility;

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
      name: ['', Validators.compose([Validators.required, Validators.maxLength(45)])],
      img: [null],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(1000)])],
      exclusions: ['', Validators.compose([Validators.maxLength(1000)])],
      processingType: [this.PROCESSING_TYPE.MANUAL],
      lkpDiscountTypeOid: [null],
      lkpDiscountRuleOid: [null],
      discountAmount: [0],
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
    this.days = Utils.getDays();
    this.presentLoading();

    // SUBSCRIBE TO FORM
    //this.myForm.valueChanges.subscribe(data => this.onChange(data, 'start'));    // all
    //this.myForm.get('dateRuleTimeEnd').valueChanges.subscribe(data => this.onChange(data, 'end'));    // all
    //this.myForm.get('processingType').valueChanges.subscribe(data => this.onProcessingTypeChanged(data));

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
    const lkpObj = this.lkps.discountRule.find((x) => x.oid === event);
    return lkpObj.value;
  }
 

  discountRuleChanged(event): void {
    this.currentDiscountRule = event ? this.getCurrentDiscountRule(event) : null;

    const conditions = this.doCallGetProducts && this.currentDiscountRule === this.DISCOUNT_RULE.PRODUCT;
    if (conditions) {
      this.API.stack(ROUTES.getProductsNameAndOid + `/${this.auth.companyOid}`, "GET")
        .subscribe(
          (response) => {
            this.doCallGetProducts = false;
            this.products = response.data.products;            
            
            console.log('response.data: ' ,response.data);
          }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }

  discountTypeChanged(event): void {
    const obj = this.lkps.discountType.find((x) => x.oid === event);
    this.currentDiscountType = obj.value;
    
    this.myForm.patchValue({discountAmount: null});
  }

  onSetProcessingType(processingType): void {
    // changes validation/errors
    let formCtrls = ['discountType', 'discountRule', 'discountAmount', 'dateRuleDays', 'dateRuleTimeStart', 'dateRuleTimeEnd'];
    let newValue = null;

    this.myForm.patchValue({ 
        discountType: newValue,
        discountRule: newValue,
        productOid: newValue,
        dateRuleDays: newValue,
        dateRuleTimeStart: newValue,
        dateRuleTimeEnd: newValue,
        discountAmount: 0, 
        processingType: processingType
    });
    
    formCtrls.forEach((key, index) => {
      if (this.myForm.controls && this.myForm.controls[key]) {
        if (processingType === this.PROCESSING_TYPE.AUTOMATIC) {
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

  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.imageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.imageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        img: Utils.generateImgName({appImgIndex: 16, name: this.myForm.controls["name"].value, companyOid: this.auth.companyOid})
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(myForm): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageUtility.uploadImg('upload-img-no-callback', myForm.img, this.imgSrc, ROUTES.uploadImgNoCallback).then((data) => {
        resolve();
      })
      .catch((err) => {
        console.log("catch from upload img");
        reject(err);
      })
    })
  }

  submit(myForm): void {    

    /*** package ***/
    if (myForm.dateRuleDays) {
      myForm.dateRuleDays = myForm.dateRuleDays.join(",");
      myForm.dateRuleTimeStart = DateUtils.getHours(myForm.dateRuleTimeStart);
      myForm.dateRuleTimeEnd = DateUtils.getHours(myForm.dateRuleTimeEnd);
    }
    myForm.startDate = DateUtils.patchStartTime(myForm.startDate);
    myForm.expiryDate = DateUtils.patchEndTime(myForm.expiryDate);

    this.presentLoading(AppViewData.getLoading().saving);

    if (myForm.img) {
      this.uploadImg(myForm).then(() => {
        this.finishSubmit(myForm);
      }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD));
    } else this.finishSubmit(myForm);
  }

  finishSubmit(myForm) {
    const toData: ToDataSaveOrEditReward = {toData: myForm, companyOid: this.auth.companyOid};
    console.log("toData: ", toData);
    this.API.stack(ROUTES.saveReward, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
            setTimeout(() => this.navCtrl.pop(), 500);  
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}

interface ToDataSaveOrEditReward {
  toData: any;
  companyOid: number;
}