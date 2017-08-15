import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { API, ROUTES } from '../../global/api';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Authentication } from '../../global/authentication';
import { CONST_ID_TYPES, CONST_REWARDS_TYPES } from '../../global/global';
import { IErrChecks, IBarcodeUserData, IBarcodeRewardData, ICompanyDetails } from '../../models/models';
import { NativeNotifications } from '../../global/native-notifications';
import { DateUtils } from '../../utils/date-utils';
import { Utils } from '../../utils/utils';
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
    balance: 0,
    rewardsSavings: 0
  };
  total: string = null;
  taxes: number = 0;
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
  taxesAlreadyCalculated: boolean = false;

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
      super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
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

  calculateTaxes(total) {
    if (!+total || isNaN(total)) {
      this.total = "0";
    } else if (!isNaN(+total) && !this.taxesAlreadyCalculated) {
      this.taxes = +Utils.roundAndAppendZero(+total * this.companyDetails.taxRate);
      this.total = Utils.roundAndAppendZero(+total + (this.taxes));
    }
  }

  clear() {
    this.taxesAlreadyCalculated = false;
    this.total = "0";
    this.taxes = 0;
  }

  onKeypressTotal(e) {
    const allowedKeys = "0123456789.";
    if (allowedKeys.indexOf(e.key) > -1 || e.keyCode === 13) return;
    else e.preventDefault();
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
              if (data.subtotal) {
                this.userData.rewardsSavings = +this.total - data.subtotal;
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
          let barcodeUserDataArr: Array<string> = barcodeData.text.split("$");
          let barcodeUserData = {
            userOid: +barcodeUserDataArr[0],
            companyOid: +barcodeUserDataArr[1],
            isSocialMediaUsed: +barcodeUserDataArr[2] === 0 ? false : true,
            socialMediaType: +barcodeUserDataArr[3]
          }

          // do conditional social media accept here
          if (barcodeUserData.isSocialMediaUsed) {
            this.presentAcceptOrRejectSocialMediaAlert(barcodeUserData).then((data) => {
              this.finishOnScanUserBarcode(data.barcodeUserData);
            })
          } else this.finishOnScanUserBarcode(barcodeUserData);
        }
      }
    }, this.errorHandler(this.ERROR_TYPES.PLUGIN.BARCODE));
  }

  finishOnScanUserBarcode(barcodeUserData: IBarcodeUserData) {
    this.userData.userOid = barcodeUserData.userOid;
    this.barcodeUserData = barcodeUserData;
    this.getUserDataForProcessOrderAPI(this.barcodeUserData.userOid, CONST_ID_TYPES.USER, {isSocialMediaUsed: this.barcodeUserData.isSocialMediaUsed, socialMediaType: this.barcodeUserData.socialMediaType});
  }

  presentAcceptOrRejectSocialMediaAlert(barcodeUserData: IBarcodeUserData): Promise<{barcodeUserData: IBarcodeUserData}> {
    return new Promise((resolve, reject) => {
      let acceptOrRejectSocialMediaAlert = this.alertCtrl.create({
        title: "Social Media Used!", 
        message: `Type of social media used: ${barcodeUserData.socialMediaType}`,
        buttons: [
          {
            text: "REJECT", 
            handler: () => {
              barcodeUserData.socialMediaType = null;
              barcodeUserData.isSocialMediaUsed = false;

              resolve({barcodeUserData});
            }
          }, {
            text: "ACCEPT",
            handler: () => {
              resolve({barcodeUserData});
            }
          }
        ]});
        acceptOrRejectSocialMediaAlert.present();
    });
  }


  // social media options are optional b/c cant guarantee if mobileCardId entered rather than barcode
  getUserDataForProcessOrderAPI(userOidOrMobileCardId, type, socialMediaOpts = {socialMediaType: null, isSocialMediaUsed: false}) {
    this.presentLoading();
    let toData = { ID: userOidOrMobileCardId, companyOid: this.auth.companyOid, type};

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
            if (this.userData.balance < +this.total) {
              if (this.companyDetails.acceptsPartialPayments) {
                if (this.userData.isSocialMediaUsed) {
                    //this.order.transactionDetails.isSocialMediaUsed = true;
                    //this.order.transactionDetails.lkpSocialMediaTypeOid = this.userData.lkpSocialMediaTypeOid;
                } 
              } else {
                this.showPopup({
                  title: 'Uh oh!', 
                  message: "The customer doesn't have the proper funds available. Your company doesn't allow partial payments (to pay with both application mobile card and cash/card).", 
                  buttons: [{text: "OK"}]
                });
                this.sufficientFunds = false;
              }
            } 
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

   // manual entering mobileCardId
  presentEnterMobileCardIdModal() {
    // modal to enter digits
    // on dismiss: make api call to get userInfo
    let enterMobileCardIdModal = this.modalCtrl.create('EnterIDPage', { }, {enableBackdropDismiss: true, showBackdrop: true});
    enterMobileCardIdModal.onDidDismiss((data) => {
      debugger;
      if (data && data.mobileCardId) {
         this.getUserDataForProcessOrderAPI(data.mobileCardId, CONST_ID_TYPES.PAYMENT);
      }
    });
    enterMobileCardIdModal.present();
  }

  doChecks(total): IErrChecks {
    let errs = [];

    if (!total.toString().match(/^\d+(?:\.\d{0,2})?$/)) {
      errs.push("Please enter a valid subtotal.")
      return {isValid: false, errs};
    } else return {isValid: true, errs: []}
  }

  submit() {
    let doChecks = this.doChecks(this.total);

    if (!doChecks.isValid) {
      this.presentToast(false, doChecks.errs.join(". "));
    } else {
      this.presentLoading();

      let taxes = (+this.total * this.companyDetails.taxRate);
      let subtotal = +this.total - taxes;

      const toData = {
        companyOid: this.auth.companyOid,
        userOid: this.userData.userOid,
        locationOid: this.auth.locationOid,
        total: this.total,
        subtotal: subtotal,
        reasonForEdit: this.reasonForEdit,
        taxes: taxes,
        rewardsSavings: this.userData.rewardsSavings,
        isRewardUsed: this.isRewardUsed,
        isRewardIndividualUsed: this.dataFromRewardIndividualBarcodeScan.type === CONST_REWARDS_TYPES.REWARDS_INDIVIDUAL,
        isSocialMediaUsed: this.userData.isSocialMediaUsed,
        socialMediaType: this.userData.socialMediaType,
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