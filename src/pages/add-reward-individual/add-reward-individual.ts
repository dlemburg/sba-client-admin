import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { API, ROUTES } from '../../global/api.service';
import { AsyncValidation } from '../../global/async-validation.service';
import { UtilityService } from '../../global/utility.service';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppDataService } from '../../global/app-data.service';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Dates } from '../../global/dates.service';

@IonicPage()
@Component({
  selector: 'page-add-reward-individual',
  templateUrl: 'add-reward-individual.html'
})
export class AddRewardIndividualPage extends BaseViewController {
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
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder, private AsyncValidation: AsyncValidation) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

     this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
      img: [null],
      description: [null, Validators.compose([Validators.required, Validators.maxLength(200)])],
      exclusions: [null, Validators.compose([Validators.maxLength(200)])],
      lkpRewardIndividualTypeOid: [null, Validators.required],
    /*  hasExpiryDate: [false, Validators.required], */
     // isFreePurchaseItem: [true, Validators.required],
     // expiryDate: [null]
    });
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.days = UtilityService.getDays();
    this.presentLoading();

    // SUBSCRIBE TO FORM
    //this.myForm.valueChanges.subscribe(data => this.onChange(data, 'start'));    // all
    //this.myForm.get('dateRuleTimeEnd').valueChanges.subscribe(data => this.onChange(data, 'end'));    // all
   // this.myForm.get('hasExpiryDate').valueChanges.subscribe(data => this.onHasExpiryDateChanged(data));

    // get lkps
    this.API.stack(ROUTES.getLkpsIndividualRewardTypes + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.lkps.individualRewardTypes = response.data.individualRewardTypes;
              console.log('response.data: ', response.data);
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  navExplanations(): void {
    this.presentModal('ExplanationsPage', {type: "RewardsIndividual"});
  }


  onHasExpiryDateChanged(data): void {
    // change validation/errors
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

  submit(myForm): void {
    /*** package ***/
    if (myForm.hasExpiryDate) this.myForm.patchValue({expiryDate: Dates.patchEndTime(this.myForm.controls.expiryDate.value)});

    this.presentLoading(AppDataService.loading.saving);
    const toData: ToDataSaveOrEditReward = {toData: myForm, companyOid: this.auth.companyOid};
    this.API.stack(ROUTES.saveRewardIndividual, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(AppDataService.loading.saved);
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }
}
interface ToDataSaveOrEditReward {
  companyOid: number;
  toData: any;
}