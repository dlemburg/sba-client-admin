import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { API, ROUTES } from '../../global/api';
import { AppViewData } from  '../../global/app-data';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Authentication } from '../../global/authentication';
import { CONST_ID_TYPES, CONST_REWARDS_TYPES } from '../../global/global';
import { IUserDataForProcessOrder, IErrChecks, IBarcodeUserData, IBarcodeRewardData, ICompanyDetails } from '../../models/models';
import { NativeNotifications } from '../../global/native-notifications';
import { DateUtils } from '../../utils/date-utils';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
  selector: 'page-simple-processing',
  templateUrl: 'simple-processing.html',
})
export class SimpleProcessingPage extends BaseViewController {

  dataFromRewardIndividualBarcodeScan: any;
  userData = {
    userOid: null,
    email: null,
    companyOid: null,
    socialMediaType: null,
    isSocialMediaUsed: false,
    balance: 0
  };
  total: number = null;
  reasonForEdit: string = null;
  rewards: Array<any> = [];
  rewardOid: number;
  barcodeUserData: IBarcodeUserData;
  employeeComments: string;
  isRewardUsed: boolean = false;
  auth: any = this.authentication.getCurrentUser();
  sufficientFunds: boolean = false;
  barcodeRewardData: IBarcodeRewardData;
  companyDetails: ICompanyDetails = {};
  

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public barcodeScanner: BarcodeScanner,
    public nativeNotifications: NativeNotifications, 
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    public viewCtrl: ViewController) {
    super(alertCtrl, toastCtrl, loadingCtrl);

  }

  ionViewDidLoad() {
    this.getCompanyDetailsAPI();
  }

   getCompanyDetailsAPI() {
    this.presentLoading();
    this.API.stack(ROUTES.getCompanyDetailsForTransaction, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              
              this.companyDetails = response.data.companyDetails;
              this.dismissLoading();
            }, this.errorHandler(this.ERROR_TYPES.API));
  }

  onScanIndividualRewardBarcode() {
    this.barcodeScanner.scan({resultDisplayDuration: 0}).then((barcodeData) => {
      console.log("barcodeData: ", barcodeData);

      /*
        // barcode data will only have rewardOid, isFreePurchaseItem, userOid
        // i.e.: 139$1$28
      */
      if (!barcodeData.cancelled) {
        if (barcodeData.text.indexOf("$") > -1) {
          let barcodeRewardData: Array<string> = barcodeData.text.split("$");
          this.barcodeRewardData = {
            rewardOid: +barcodeRewardData[0],
            isFreePurchaseItem: +barcodeRewardData[1] === 0 ? false : true,
            userOid: +barcodeRewardData[2]
          }
          this.isRewardUsed = true;
          this.rewards = [...this.rewards, {rewardOid: this.barcodeRewardData.rewardOid, isRewardAll: false, isFreePurchaseItem: this.barcodeRewardData.isFreePurchaseItem}];
        }
        
        if (this.barcodeRewardData.isFreePurchaseItem) {
          this.alertEmployeeFreePurchaseItem().then(() => {
             // get reward data and display in modal, amount to subtract input, accept button
            let modal = this.modalCtrl.create("EditSubtotalPage", {subtotal: this.total, type: "total"});
            modal.present();
            modal.onDidDismiss((data) => {
              if (data.total) {
                this.total = data.subtotal;
                this.reasonForEdit = data.reasonForEdit
              }
            });
          })
          .catch(() => {
            console.log("error resolving alertEmployeeFreePurchaseItme");
          })
        }
      } 
    }, this.errorHandler(this.ERROR_TYPES.PLUGIN.BARCODE));
  }

  alertEmployeeFreePurchaseItem() {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: "Individual Reward Scanned", 
        message: "This individual reward is eligible for a free purchase item!",
        buttons: [{
          text: "OK, go to edit total!",
          handler: () => {
            resolve();
          }
        }]
      });
      alert.present();
    });
  }

 
  onScanUserBarcode() {
    this.barcodeScanner.scan({resultDisplayDuration: 0}).then((barcodeData) => {
      console.log("barcodeData: ", barcodeData);

      /*
        // barcode data will have  userOid, companyOid, isSocialMediaUsed, socialMediaType: string separated by $
        // i.e.:  148$12$0$17
      */
      if (!barcodeData.cancelled) {
        if (barcodeData.text.indexOf("$") > -1) {
          let barcodeUserData: Array<string> = barcodeData.text.split("$");
          this.barcodeUserData = {
            userOid: +barcodeUserData[0],
            companyOid: +barcodeUserData[1],
            isSocialMediaUsed: +barcodeUserData[2] === 0 ? false : true,
            socialMediaType: +barcodeUserData[3]
          }
          this.getUserDataForProcessOrderAPI(this.barcodeUserData.userOid, CONST_ID_TYPES.USER, {isSocialMediaUsed: this.barcodeUserData.isSocialMediaUsed, socialMediaType: this.barcodeUserData.socialMediaType}); 
        }
      }
    }, this.errorHandler(this.ERROR_TYPES.PLUGIN.BARCODE));
  }


  // social media options are optional b/c cant guarantee if paymentID entered rather than barcode
  getUserDataForProcessOrderAPI(userOidOrPaymentID, type, socialMediaOpts = {socialMediaType: null, isSocialMediaUsed: false}) {
    this.presentLoading();
    let toData = { ID: userOidOrPaymentID, companyOid: this.auth.companyOid, type};

    // get user data
    this.API.stack(ROUTES.getUserDataForProcessOrder, "POST", toData)
      .subscribe(
          (response) => {
            console.log('response.data: ', response.data);
            this.dismissLoading();
            this.userData = response.data;
            this.userData.socialMediaType = socialMediaOpts.socialMediaType;
            this.userData.isSocialMediaUsed = socialMediaOpts.isSocialMediaUsed;

            // do checks
            if (this.userData.balance < this.total) {
              if (this.companyDetails.acceptsPartialPayments) {
                if (this.userData.isSocialMediaUsed) {
                    //this.order.transactionDetails.isSocialMediaUsed = true;
                    //this.order.transactionDetails.lkpSocialMediaTypeOid = this.userData.lkpSocialMediaTypeOid;
                } 
              } else {
                this.showPopup({
                  title: 'Uh oh!', 
                  message: "The customer doesn't have the proper funds. This company doesn't allow partial payments (application and cash/card).", 
                  buttons: [{text: "OK"}]
                });
                this.sufficientFunds = false;
              }
            } 
          },this.errorHandler(this.ERROR_TYPES.API));
  }

   // manual entering paymentID
  presentEnterUserPaymentIDModal() {
    // modal to enter digits
    // on dismiss: make api call to get userInfo
    let enterUserPaymentIDModal = this.modalCtrl.create('EnterIDPage', { }, {enableBackdropDismiss: true, showBackdrop: true});
    enterUserPaymentIDModal.onDidDismiss((data) => {
      if (data.paymentID) {
         // API get user info
         this.getUserDataForProcessOrderAPI(data.paymentID, CONST_ID_TYPES.PAYMENT);
      }
    });
    enterUserPaymentIDModal.present();
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
      this.presentToast(false, doChecks.errs.join(". "));
    } else {
      this.presentLoading();

      let taxes = (this.total * this.companyDetails.taxRate);
      let subtotal = this.total - taxes;

      const toData = {
        companyOid: this.auth.companyOid,
        locationOid: this.auth.locationOid,
        total: this.total,
        subtotal: subtotal,
        reasonForEdit: this.reasonForEdit,
        taxes: taxes,
        isRewardUsed: this.isRewardUsed,
        isRewardIndividualUsed: this.dataFromRewardIndividualBarcodeScan.type === CONST_REWARDS_TYPES.REWARDS_INDIVIDUAL,
        isSocialMediaUsed: this.userData.isSocialMediaUsed,
        lkpSocialMediaTypeOid: this.userData.socialMediaType,
        purchaseDate: DateUtils.toLocalIsoString(new Date().toString()),
        employeeComments: this.employeeComments
      }

      this.API.stack(ROUTES.processTransactionSimpleProcessing, "POST", toData)
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.companyDetails = response.data.companyDetails;

              this.dismissLoading();
            }, this.errorHandler(this.ERROR_TYPES.API));
    }

  }
}