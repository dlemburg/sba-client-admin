import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Validation } from '../../global/validation';
import { AsyncValidation } from '../../global/async-validation.service';
import { UtilityService } from '../../global/utility.service';
import { INameAndOid, AuthUserInfo } from '../../models/models';
import { API, ROUTES } from '../../global/api.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Dates } from '../../global/dates.service';

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
  placeholders: any  = {
    longDescription: `This description will be on the reward page (and what your employees will use to verify processing manually.)`,
    shortDescription: 'This description will appear on the rewards list page.'
  };
  originalValue: string = null;

constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

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
    }, {validator: Validators.compose([Validation.discountAmountInvalid('lkpDiscountTypeOid', 'discountAmount'), Validation.isInvalidDate('startDate', 'expiryDate'), Validation.isInvalidDate('dateRuleTimeStart', 'dateRuleTimeEnd')])});
  }


  ionViewDidLoad() {

    /*** going to have to do something with dateRuleTimeStart and dateRuleTimeEnd- 
     * coming in as number (changed it to make server call easier), need to get it to ISO string for client***/
    
    this.days = UtilityService.getDays();
    this.auth = this.authentication.getCurrentUser();

    // SUBSCRIBE TO FORM
    this.myForm.valueChanges.subscribe(data => this.onFormChanged(data));    // all
    this.myForm.get('processingType').valueChanges.subscribe(data => this.onProcessingTypeChanged(data));


    // get name and oid of all rewards
    this.API.stack(ROUTES.getRewardsNameAndOid + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              this.values = response.data.values;
              console.log('response.data: ', response.data);
              
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });

     // get lkps- doesn't need to be async
    this.API.stack(ROUTES.getProcessingAndDiscountLkps, "GET")
        .subscribe(
            (response) => {
              let { discountType, discountRule } = response.data.processingAndDiscountLkps;
              this.lkps.discountType = discountType;
              this.lkps.discountRule = discountRule;

              console.log('response.data: ', response.data);
              
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  navExplanations(): void {
    this.presentModal('ExplanationsPage', {type: "Rewards"});
  }

  onFormChanged(data) {}

  // reward to edit is selected
  editValueChange(): void {
    if (this.editOid) {
      this.presentLoading();

      this.API.stack(ROUTES.getRewardToEdit + `/${this.editOid}`, "GET")
          .subscribe(
              (response) => {
                this.dismissLoading();
                let {reward} = response.data;

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
                  dateRuleDays: reward.dateRuleDays ? UtilityService.toArray(reward.dateRuleDays) : null,
                  dateRuleTimeStart: reward.dateRuleTimeStart !== null ? Dates.convertTimeStringToIsoString(reward.dateRuleTimeStart) : null,
                  dateRuleTimeEnd: reward.dateRuleTimeEnd !== null ? Dates.convertTimeStringToIsoString(reward.dateRuleTimeEnd) : null,
                  startDate: reward.startDate,
                  expiryDate: reward.expiryDate,
                });

                console.log("response.data.reward: ", response.data.reward);

                // init everything with value to init dynamic value changes
                this.originalValue = reward.name;
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
                        }, (err) => {
                          const shouldPopView = false;
                          this.errorHandler.call(this, err, shouldPopView)
                        });
                }
                
              }, (err) => {
                const shouldPopView = false;
                this.errorHandler.call(this, err, shouldPopView)
              });
    }
  }

  setCurrentDiscountRule(oid: number): string {
    let lkpObj = this.lkps.discountRule.find((x) => {
        return x.oid === oid;
    });
    return lkpObj.value ? lkpObj.value : "";
  }

  setCurrentDiscountType(oid: number): string {
    let lkpObj = this.lkps.discountType.find((x) => {
        return x.oid === oid;
    });
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
    this.presentLoading(AppDataService.loading.removing);
    this.API.stack(ROUTES.removeReward + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(AppDataService.loading.removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        }, (err) => {
          const shouldPopView = false;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

  submit(myForm): void {
    let expiryDate = this.myForm.controls.expiryDate.value.toString();
    let startDate = this.myForm.controls.startDate.value.toString();


    /*** Package for submit ***/
    this.presentLoading(AppDataService.loading.saving);
    this.myForm.patchValue({
      startDate: expiryDate.indexOf("T23:59:59") < 0 ? Dates.patchStartTime(myForm.startDate) : expiryDate,
      expiryDate: startDate.indexOf("T00:00:00") < 0 ? Dates.patchEndTime(myForm.expiryDate) : startDate,
      dateRuleTimeStart: myForm.dateRuleTimeStart ? Dates.getHours(myForm.dateRuleTimeStart) : null,
      dateRuleTimeEnd: myForm.dateRuleTimeEnd ? Dates.getHours(myForm.dateRuleTimeEnd) : null,
      dateRuleDays: myForm.dateRuleDays ? UtilityService.arrayToString(myForm.dateRuleDays): null
    });

    const toData: ToDataEditReward = {toData: myForm, companyOid: this.auth.companyOid, editOid: this.editOid};
    debugger;
    console.log("toData: ", toData);
    
    this.API.stack(ROUTES.editReward, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(AppDataService.loading.saved);
            //this.navCtrl.pop();
            console.log('response: ', response);            
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }

}

interface ToDataEditReward {
  toData: any;
  companyOid: number;
  editOid: number;
}