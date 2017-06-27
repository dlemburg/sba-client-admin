import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Validation } from '../../utils/validation-utils';
import { AppUtils } from '../../utils/app-utils';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';

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
  PROCESSING_TYPE: any = {
    AUTOMATIC: 'Automatic', 
    MANUAL: 'Manual'
  };
  DISCOUNT_TYPE: any = {
    MONEY: 'Money',
    NEWPRICE: 'New Price',
    PERCENT: 'Percent'
  };
  DISCOUNT_RULE: any = {
    PRODUCT: 'Product',
    DATE: 'Date-Time-Range'
  };
  lkps: any = {
    discountType: [],
    discountRule: []
  }
  doCallGetProducts: boolean = true;
  isSubmitted: boolean;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public validation: Validation, public dateUtils: DateUtils, public appUtils: AppUtils, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

     this.myForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
      img: [''],
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

    }, {validator: Validators.compose([this.validation.isDiscountAmountInvalid('lkpDiscountTypeOid', 'discountAmount'), this.validation.isInvalidDate('startDate', 'expiryDate'), this.validation.isInvalidTime('dateRuleTimeStart', 'dateRuleTimeEnd')])});
  }


  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.days = this.appUtils.getDays();
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
              
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  navExplanations() {
    this.presentModal('ExplanationsPage', {type: "Rewards"});
  }

  getCurrentDiscountRule(event): string {
    debugger;
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
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
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

  submit(myForm): void {
    /*** package ***/
    this.myForm.patchValue({
      startDate: this.dateUtils.patchStartTime(myForm.startDate),
      expiryDate: this.dateUtils.patchEndTime(myForm.expiryDate)
    });
    if (myForm.dateRuleDays) {
      this.myForm.patchValue({
        dateRuleDays: myForm.dateRuleDays.join(","),  // convert to string
        dateRuleTimeStart: this.dateUtils.getHours(myForm.dateRuleTimeStart),
        dateRuleTimeEnd: this.dateUtils.getHours(myForm.dateRuleTimeEnd),
      });
    }


    this.presentLoading(this.appData.getLoading().saving);
    const toData: ToDataSaveOrEditReward = {toData: myForm, companyOid: this.auth.companyOid, isEdit: false};
    
    console.log("toData: ", toData);
    
    this.API.stack(ROUTES.saveReward, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(this.appData.getLoading().saved);
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }
}
interface ToDataSaveOrEditReward {
  toData: any;
  companyOid: number;
  isEdit: boolean;
}