import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { INameAndOid, AuthUserInfo } from '../../models/models';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_DISCOUNT_RULE, CONST_DISCOUNT_TYPE, CONST_PROCESSING_TYPE } from '../../global/global';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';
import { CONST_NODE_MULTER_ACTIONS } from '../../global/global';

@IonicPage()
@Component({
  selector: 'page-edit-reward',
  templateUrl: 'edit-reward.html'
})
export class EditRewardPage extends BaseViewController {
  doPatch: boolean = true;
  currentDiscountType: string;
  currentDiscountRule: string;
  rewardOid: number;
  auth: AuthUserInfo;
  editOid : number = null;
  values: Array<INameAndOid> = [];
  days: Array<string>;
  myForm: any;
  products: Array<INameAndOid> = [];
  PROCESSING_TYPE = CONST_PROCESSING_TYPE;
  DISCOUNT_TYPE = CONST_DISCOUNT_TYPE;
  DISCOUNT_RULE = CONST_DISCOUNT_RULE;
  lkps: any = {
    discountType: [],
    discountRule: []
  }
  doCallGetProducts: boolean = true;
  placeholders: any  = {
    longDescription: `This description will be on the reward page (and what your employees will use to verify processing manually.)`,
    shortDescription: 'This description will appear on the rewards list page.'
  };
  imgSrc: string = null;
  img: string = null;
  oldImg: string = null;
  imgDidChange: boolean = false;
  failedUploadImgAttempts = 0;
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
      name: ['', Validators.compose([Validators.required, Validators.maxLength(60)])],
      img: [''],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(1000)])],
      exclusions: ['', Validators.compose([Validators.maxLength(1000)])],
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
    }, {validator: Validators.compose([Validation.isDiscountAmountInvalid('lkpDiscountTypeOid', 'discountAmount'), Validation.isInvalidDate('startDate', 'expiryDate'), Validation.isInvalidDate('dateRuleTimeStart', 'dateRuleTimeEnd')])});
  }


  ionViewDidLoad() {

    /*** going to have to do something with dateRuleTimeStart and dateRuleTimeEnd- 
     * coming in as number (changed it to make server call easier), need to get it to ISO string for client***/
    
    this.days = Utils.getDays();
    this.auth = this.authentication.getCurrentUser();

    // SUBSCRIBE TO FORM
    this.myForm.valueChanges.subscribe(data => {this.onFormChanged(data)});    // all
    this.myForm.get('processingType').valueChanges.subscribe((data) => {this.onProcessingTypeChanged(data)});
    //this.myForm.get('img').valueChanges.subscribe((data) => { this.onImgDidChange(data)});
    this.presentLoading();
    
    // get name and oid of all rewards
    this.API.stack(ROUTES.getRewardsNameAndOid + `/${this.auth.companyOid}`, "GET")
      .subscribe(
        (response) => {
          this.values = response.data.values;
          console.log('response.data: ', response.data);
          
        }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));

     // get lkps- doesn't need to be async
    this.API.stack(ROUTES.getProcessingAndDiscountLkps, "GET")
      .subscribe(
          (response) => {
            let { discountType, discountRule } = response.data.processingAndDiscountLkps;
            this.lkps.discountType = discountType;
            this.lkps.discountRule = discountRule;

            console.log('response.data: ', response.data);
            this.dismissLoading();
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "Rewards"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
  }


  onFormChanged(data) {}
  onImgDidChange(data) { this.imgDidChange = true }

  // reward to edit is selected
  editValueChange(): void {
    if (this.editOid) {
      this.presentLoading();

      this.API.stack(ROUTES.getRewardToEdit + `/${this.editOid}`, "GET")
          .subscribe((response) => {
            this.dismissLoading();
            const {reward} = response.data;

            debugger;
            console.log("reward: ", reward);

            this.myForm.patchValue({
              name: reward.name,
              img: reward.img,
              description: reward.description,
              exclusions: reward.exclusions,
              processingType: reward.processingType,
              lkpDiscountTypeOid: reward.lkpDiscountTypeOid,
              lkpDiscountRuleOid: reward.lkpDiscountRuleOid,
              discountAmount: reward.discountAmount,
              productOid: reward.productOid,
              dateRuleDays: reward.dateRuleDays ? reward.dateRuleDays.split(",") : null,
              dateRuleTimeStart: reward.dateRuleTimeStart !== null ? DateUtils.convertTimeStringToIsoString(reward.dateRuleTimeStart) : null,
              dateRuleTimeEnd: reward.dateRuleTimeEnd !== null ? DateUtils.convertTimeStringToIsoString(reward.dateRuleTimeEnd) : null,
              startDate: reward.startDate,
              expiryDate: reward.expiryDate,
            });
            
            // init everything with value to init dynamic value changes
            this.imgSrc = AppViewData.getDisplayImgSrc(reward.img);
            this.oldImg = reward.img;
            this.onProcessingTypeChanged(reward.processingType);
            this.currentDiscountRule = this.setCurrentDiscountRule(reward.lkpDiscountRuleOid);
            this.currentDiscountType = this.setCurrentDiscountType(reward.lkpDiscountTypeOid);

            // call once
            if (this.doCallGetProducts) { // reward.productOid !== null
              this.API.stack(ROUTES.getProductsNameAndOid + `/${this.auth.companyOid}`, "GET")
                .subscribe(
                  (response) => {
                    //this.dismissLoading();
                    this.doCallGetProducts = false;
                    this.products = response.data.products;
                    
                    console.log('response.data: ', response.data);
                  }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false} ));
            }
          },this.errorHandler(this.ERROR_TYPES.API));
    }
  }

  setCurrentDiscountRule(oid: number): string {
    let lkpObj = this.lkps.discountRule.find((x) => x.oid === oid);
    return lkpObj.value ? lkpObj.value : "";
  }

  setCurrentDiscountType(oid: number): string {
    let lkpObj = this.lkps.discountType.find((x) => x.oid === oid);
    return lkpObj.value ? lkpObj.value : "";
  }

  discountRuleChanged(ruleOid: number): void {
    this.currentDiscountRule = this.setCurrentDiscountRule(ruleOid);
  }

  discountTypeChanged(typeOid: number): void {
    this.currentDiscountType = this.setCurrentDiscountType(typeOid);
    this.myForm.patchValue({discountAmount: null});
  }

  onProcessingTypeChanged(data): void {
    let formCtrls: Array<string> = ['discountType', 'discountRule', 'discountAmount', 'dateRuleDays', 'dateRuleTimeStart', 'dateRuleTimeEnd'];
    let newValue = null;

    if (this.doPatch) {
      this.doPatch = false;

      this.myForm.patchValue({ 
          lkpDiscountTypeOid: newValue,
          lkpDiscountRuleOid: newValue,
          discountAmount: newValue, 
          productOid: newValue,
          dateRuleDays: newValue,
          dateRuleTimeStart: newValue,
          dateRuleTimeEnd: newValue,
      });
    }
    
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
    })
  }

  setProcessingType(type): void {
    this.myForm.patchValue({   // also triggers observable subscription
      processingType: type
    });
  }

  remove(): void {
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeReward + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().removed);
          setTimeout(() => this.navCtrl.pop(), 1000);
          console.log('response: ', response); 
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.imageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.imageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        img: Utils.generateImgName({appImgIndex: 14, name: this.myForm.controls["name"].value, companyOid: this.auth.companyOid})
      })
      this.imgDidChange = true;
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(myForm): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageUtility.uploadImg(CONST_NODE_MULTER_ACTIONS.UPLOAD_IMG_AND_UNLINK, myForm.img, this.imgSrc, ROUTES.uploadImgAndUnlink + `/${this.oldImg}`).then((data) => {
        resolve();
      })
      .catch((err) => {
        console.log("catch from upload img");
        reject(err);
      })
    })
  }


  submit(myForm): void {
    this.presentLoading(AppViewData.getLoading().saving);

    let expiryDate = myForm.expiryDate.toString();
    let startDate = myForm.startDate.toString();

    /*** Package for submit ***/
    myForm.expiryDate = expiryDate.indexOf("T23:59:59") < 0 ? DateUtils.patchEndTime(myForm.expiryDate) : expiryDate;
    myForm.startDate = startDate.indexOf("T00:00:00") < 0 ? DateUtils.patchStartTime(myForm.startDate) : startDate;
    
    
    myForm.dateRuleTimeStart = myForm.dateRuleTimeStart ? DateUtils.getHoursFromIsoStr(myForm.dateRuleTimeStart) : null;
    myForm.dateRuleTimeEnd = myForm.dateRuleTimeEnd ? DateUtils.getHoursFromIsoStr(myForm.dateRuleTimeEnd) : null;
    
    myForm.dateRuleDays = myForm.dateRuleDays ? myForm.dateRuleDays.join(",") : null
    
    if (myForm.img && this.imgDidChange) {
      this.uploadImg(myForm).then(() => {
        this.finishSubmit(myForm);
      }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD));
    } else this.finishSubmit(myForm);
  }

  finishSubmit(myForm) {
    const toData: ToDataEditReward = {toData: myForm, companyOid: this.auth.companyOid, editOid: this.editOid};

    this.API.stack(ROUTES.editReward, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
            setTimeout(() => this.navCtrl.pop(), 1000);  
            console.log('response: ', response);            
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}

interface ToDataEditReward {
  toData: any;
  companyOid: number;
  editOid: number;
}