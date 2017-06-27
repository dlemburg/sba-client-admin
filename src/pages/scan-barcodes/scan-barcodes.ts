import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { API, ROUTES } from '../../global/api';
import { AppData } from  '../../global/app-data';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Authentication } from '../../global/authentication';
import { COMPANY_DETAILS, ID_TYPES } from '../../global/global';
import { IUserDataForProcessOrder, IErrChecks } from '../../models/models';
import { NativeNotifications } from '../../global/native-notifications';

@IonicPage()
@Component({
  selector: 'page-scan-barcodes',
  templateUrl: 'scan-barcodes.html',
})
export class ScanBarcodesPage extends BaseViewController {

  dataFromRewardIndividualBarcodeScan: any;
  userData: IUserDataForProcessOrder = {
    userOid: null,
    email: null,
    companyOid: null,
    lkpSocialMediaTypeOid: null,
    isSocialMediaUsed: false,
    balance: 0
  };
  total: number;
  comments: string;
  auth: any;
  sufficientFunds: boolean = false;
  COMPANY_DETAILS = COMPANY_DETAILS;
  ID_TYPES = ID_TYPES;
  REWARDS_TYPE = {
    REWARDS_INDIVIDUAL: "rewards_individual",
    REWARDS_ALL: "rewards_all"
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, public nativeNotifications: NativeNotifications, public appData: AppData,  public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public viewCtrl: ViewController) {
      super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.getCompanyDetailsAPI();
  }

   getCompanyDetailsAPI() {
    this.presentLoading();
    this.API.stack(ROUTES.getCompanyDetailsForTransaction, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.COMPANY_DETAILS.ACCEPTS_PARTIAL_PAYMENTS = response.data.companyDetails.acceptsPartialPayments;
              this.COMPANY_DETAILS.HAS_SOCIAL_MEDIA = response.data.companyDetails.hasSocialMedia;
              this.COMPANY_DETAILS.SOCIAL_MEDIA_DISCOUNT_AMOUNT = response.data.companyDetails.socialMediaDiscountAmount; 
              this.COMPANY_DETAILS.DOES_CHARGE_FOR_ADDONS = response.data.companyDetails.doesChargeForAddons; 
              this.COMPANY_DETAILS.TAX_RATE = response.data.companyDetails.taxRate; 
              this.COMPANY_DETAILS.HAS_PRINTER = response.data.companyDetails.hasPrinter;

              this.dismissLoading();
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  onScanIndividualRewardBarcode() {

    /////////////////////////////////////
    ///// cordova scan barcode //////////
    /////////////////////////////////////


    // either get these from barcode, or just get userOid and oid and look up info
    // only individual rewards can be scanned, so safe here
    let data = { 
      rewardIndividualOid: 0, 
      isFreePurchaseItem: true, 
      name: "Name of individual reward", 
      userOid: 4, 
      type: this.REWARDS_TYPE.REWARDS_INDIVIDUAL,  
      processingType: this.REWARDS_TYPE.REWARDS_INDIVIDUAL,
      isUsed: true   // SETS TO TRUE b/c I will set to false explicitly if not used in algorithm below
    };
    this.dataFromRewardIndividualBarcodeScan = data;
  }

 


  onScanUserBarcode() {

    /////////////////////////////////////
    // cordova scan barcode.... fake data
    /////////////////////////////////////

    let data = { userOid: 4, email: "daniel@gmail.com", balance: 2.99, companyOid: 1, isSocialMediaUsed: true, lkpSocialMediaTypeOid: 2 };
    this.userData = {
      userOid: data.userOid, 
      balance: data.balance, 
      companyOid: data.companyOid, 
      email: data.email,
      isSocialMediaUsed: data.isSocialMediaUsed,
      lkpSocialMediaTypeOid: data.lkpSocialMediaTypeOid
    };
    ////////////////////////////////


    this.getUserDataForProcessOrderAPI(data.userOid, this.ID_TYPES.USER, {isSocialMediaUsed: data.isSocialMediaUsed, lkpSocialMediaTypeOid: data.lkpSocialMediaTypeOid}); 
  }

   getUserDataForProcessOrderAPI(ID, type, socialMediaOpts = {lkpSocialMediaTypeOid: null, isSocialMediaUsed: false}) {
    this.presentLoading();
    let toData = { ID: ID, companyOid: this.auth.companyOid, type};

    // get user data
    this.API.stack(ROUTES.getUserDataForProcessOrder, "POST", toData)
      .subscribe(
          (response) => {
            console.log('response.data: ', response.data);
            this.dismissLoading();
            this.userData.userOid = response.data.userData.userOid;
            this.userData.balance = response.data.userData.balance;
            this.userData.companyOid = response.data.userData.companyOid;
            this.userData.email = response.data.userData.email;
            this.userData.lkpSocialMediaTypeOid = socialMediaOpts.lkpSocialMediaTypeOid;
            this.userData.isSocialMediaUsed = socialMediaOpts.isSocialMediaUsed;

            // do checks
            if (this.userData.balance < this.total) {
                this.sufficientFunds = true;
              if (this.COMPANY_DETAILS.ACCEPTS_PARTIAL_PAYMENTS) {
                if (this.userData.isSocialMediaUsed) {
                  this.processSocialMediaDiscount();
                }
              } else {
                this.showPopup({
                  title: 'Uh oh!', 
                  message: "The customer doesn't have the proper funds. This company doesn't allow partial payments (application and cash/card).", 
                  buttons: [{text: "OK"}]
                });
                this.sufficientFunds = false;
              }
            } else {
              if (this.userData.isSocialMediaUsed) {
                this.processSocialMediaDiscount();
              }
            }
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView);
          });
  }

  processSocialMediaDiscount() {

  }

  doChecks(total): IErrChecks {
    let errs = [];

    if (!total.toString().match(/^\d+(?:\.\d{0,2})?$/)) {
      errs.push("Please enter a valid subtotal.")
      return {isValid: false, errs};
    }

    else return {isValid: true, errs: []}
    
  }


  submit() {
    let doChecks = this.doChecks(this.total);

    if (!doChecks.isValid) {
      this.presentToast(false, {message: doChecks.errs.join(". "), position: "bottom", duration: 1500});
    } else {

    }

  }


}
