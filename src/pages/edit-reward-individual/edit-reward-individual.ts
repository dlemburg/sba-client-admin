import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { AppUtils } from '../../utils/app-utils';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { AuthUserInfo, INameAndOid } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';

@IonicPage()
@Component({
  selector: 'page-edit-reward-individual',
  templateUrl: 'edit-reward-individual.html'
})
export class EditRewardIndividualPage extends BaseViewController {
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
    individualRewardTypes: []
  }
  doCallGetProducts: boolean = true;
  isSubmitted: boolean;
  editOid: number = null;
  values: Array<INameAndOid> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public dateUtils: DateUtils, public appUtils: AppUtils, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

     this.myForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
      img: [''],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      exclusions: ['', Validators.compose([Validators.maxLength(200)])],
      lkpRewardIndividualTypeOid: [null, Validators.required],
    //  hasExpiryDate: [false, Validators.required],
     // isFreePurchaseItem: [true, Validators.required],
     // expiryDate: ['']
    });
  }


  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.days = this.appUtils.getDays();
    this.presentLoading();

    // SUBSCRIBE TO FORM
    //this.myForm.valueChanges.subscribe(data => this.onChange(data, 'start'));    // all
    //this.myForm.get('dateRuleTimeEnd').valueChanges.subscribe(data => this.onChange(data, 'end'));    // all
   // this.myForm.get('hasExpiryDate').valueChanges.subscribe(data => this.onHasExpiryDateChanged(data));


    // get lkps
    this.API.stack(ROUTES.getLkpsIndividualRewardTypes, "GET")
        .subscribe(
            (response) => {
              this.lkps.individualRewardTypes = response.data.individualRewardTypes;
              this.getEditValues();
              console.log('response.data: ', response.data);
            }, (err) => {
              const shouldPopView = false;
              const shouldDismiss = false;
              this.errorHandler.call(this, err, shouldPopView, shouldDismiss)
            });
  }

  getEditValues(): void {
    this.API.stack(ROUTES.getRewardsIndividualNameAndOid + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.values = response.data.values;
              console.log('response.data: ', response.data);
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  getRewardIndividual(): void {
    this.presentLoading();
    this.API.stack(ROUTES.getRewardIndividualToEdit + `/${this.editOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              let { name, img, description, exclusions, hasExpiryDate, expiryDate, isFreePurchaseItem, lkpRewardIndividualTypeOid } = response.data.reward;
              this.myForm.patchValue({name, img, description, exclusions, hasExpiryDate, expiryDate: new Date(expiryDate).toISOString(), isFreePurchaseItem, lkpRewardIndividualTypeOid});
              this.onHasExpiryDateChanged(response.data.hasExpiryDate);  // init validators, etc
              console.log('response.data: ', response.data);
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  editValueChange(): void {
    if (this.editOid) this.getRewardIndividual();
  }

  navExplanations(): void {
    this.presentModal('ExplanationsPage', {type: "RewardsIndividual"});
  }

  onHasExpiryDateChanged(data): void {
    let formCtrls = ['expiryDate'];
    let newValue = null;

    this.myForm.patchValue({ 
        expiryDate: null
    });
    
    formCtrls.forEach((key, index) => {
      if (this.myForm.controls && this.myForm.controls[key]) {
        if (data === true) {
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

  remove(): void {
    this.presentLoading(this.appData.getLoading().removing);
    this.API.stack(ROUTES.removeRewardIndividual + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(this.appData.getLoading().removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        }, (err) => {
          const shouldPopView = true;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }


  submit(myForm): void {
    let expiryDate = this.myForm.controls.expiryDate.value.toString();
    
    /*** package ***/
    this.presentLoading(this.appData.getLoading().saving);
    if (myForm.hasExpiryDate) this.myForm.patchValue({expiryDate: expiryDate.indexOf("T23:59:59") < 0 ? this.dateUtils.patchStartTime(this.myForm.controls.startDate.value) : expiryDate})
    const toData: ToDataSaveOrEditReward = {toData: this.myForm.value, companyOid: this.auth.companyOid, editOid: this.editOid};
    this.API.stack(ROUTES.editRewardIndividual, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(this.appData.getLoading().saved);
            this.navCtrl.pop();
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }
}
interface ToDataSaveOrEditReward {
  companyOid: number;
  toData: any;
  editOid: number;
}