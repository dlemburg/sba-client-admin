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
  dataFromRewardIndividualBarcodeScan: any = {
    type: null
  };
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
  sufficientFunds: boolean = true;
  barcodeRewardData: IBarcodeRewardData;
  companyDetails: ICompanyDetails = {};
  taxesAlreadyCalculated: boolean = false;
  mobileCardId: number = null;
  taxClicks: number = 0;

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
    this.taxClicks += 1;
    if (!+total || isNaN(total)) {
      this.total = "0";
    } else if (!isNaN(+total) && !this.taxesAlreadyCalculated) {
      this.taxes = +Utils.roundAndAppendZero(+total * this.companyDetails.taxRate);
      this.total = Utils.roundAndAppendZero(+total + (this.taxes));
    }
    this.taxClicks > 1 ? this.presentToast(false, `Warning! You have calculated taxes ${this.taxClicks} times on this order. `) : null;
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
            let modal = this.modalCtrl.create("EditTotalPge", {total: this.total});
            modal.present();
            modal.onDidDismiss((data) => {
              if (data.total) {
                this.userData.rewardsSavings = +this.total - data.total;
                this.total = data.total;
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

      // barcode data will have  userOid, companyOid, isSocialMediaUsed, socialMediaType: string separated by $
      // i.e.:  148$12$0$17
      if (!barcodeData.cancelled) {
        if (barcodeData.text.indexOf("$") > -1) {
          let barcodeUserDataArr: Array<string> = barcodeData.text.split("$");
          let barcodeUserData = {
            userOid: +barcodeUserDataArr[0],
            companyOid: +barcodeUserDataArr[1],
            isSocialMediaUsed: +barcodeUserDataArr[2] === 0 ? false : true,
            socialMediaType: +barcodeUserDataArr[3]
          }

          if (barcodeUserData.companyOid === +this.auth.companyOid) {
            if (barcodeUserData.isSocialMediaUsed) {
              this.presentAcceptOrRejectSocialMediaAlert(barcodeUserData).then((data) => {
                this.finishOnScanUserBarcode(data.barcodeUserData);
              })
            } else this.finishOnScanUserBarcode(barcodeUserData);
          }
        }
      }
    }, this.errorHandler(this.ERROR_TYPES.PLUGIN.BARCODE));
  }

  finishOnScanUserBarcode(barcodeUserData: IBarcodeUserData) {
    //this.userData.userOid = barcodeUserData.userOid;
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
  getUserDataForProcessOrderAPI(userOidOrMobileCardId, idType, socialMediaOpts = {socialMediaType: null, isSocialMediaUsed: false}) {
    this.presentLoading();
    let toData = { userOidOrMobileCardId: userOidOrMobileCardId, companyOid: this.auth.companyOid, idType};
    // get user data
    this.API.stack(ROUTES.getUserDataForProcessOrder, "POST", toData)
      .subscribe(
          (response) => {
            console.log('response.data: ', response.data);
            this.dismissLoading();
            this.userData = response.data.userData ? response.data.userData : {userOid: null, balance: null};
            this.userData.socialMediaType = socialMediaOpts.socialMediaType;
            this.userData.isSocialMediaUsed = socialMediaOpts.isSocialMediaUsed;

            // do checks
            if (this.userData.userOid === null) this.presentToast(false, `No user found by this id number.`)
            else if (this.userData.balance > +this.total) {
              /* if (this.companyDetails.acceptsPartialPayments) {} */
              this.presentToast(false, `Captured user info! Complete transaction at any time.`);
            } 
            else {
              this.sufficientFunds = false;
              this.mobileCardId = null;

              this.showPopup({
                title: 'Uh oh!', 
                message: "The customer has insufficient funds. Customer balance: $" + this.userData.balance, 
                buttons: [{text: "OK"}]
              });
            } 
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

   // manual entering mobileCardId
  presentEnterMobileCardIdModal() {
    // modal to enter digits
    // on dismiss: make api call to get userInfo
    if (this.total === null || this.total == undefined) this.presentToast(false, `Please enter a total first!`, "top")
    else {
      let enterMobileCardIdModal = this.modalCtrl.create('EnterIDPage', { }, {enableBackdropDismiss: true, showBackdrop: true});
      enterMobileCardIdModal.onDidDismiss((data) => {
        if (data && data.mobileCardId) {
          this.getUserDataForProcessOrderAPI(data.mobileCardId, CONST_ID_TYPES.MOBILE_CARD_ID);
          this.mobileCardId = data.mobileCardId;
        }
      });
      enterMobileCardIdModal.present();
    }
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

      let taxes = this.taxes? this.taxes : (+this.total * this.companyDetails.taxRate);
      let subtotal = +this.total - taxes;

      const toData = {
        companyOid: this.auth.companyOid,
        userOid: this.userData.userOid,
        locationOid: this.auth.locationOid,
        total: this.total,
        subtotal: subtotal,
        reasonForEdit: this.reasonForEdit,
        taxes: taxes,
        rewards: this.rewards,
        rewardsSavings: this.userData.rewardsSavings,
        isRewardUsed: this.isRewardUsed,
        isRewardIndividualUsed: this.dataFromRewardIndividualBarcodeScan.type === CONST_REWARDS_TYPES.REWARDS_INDIVIDUAL,
        isSocialMediaUsed: this.userData.isSocialMediaUsed,
        socialMediaType: this.userData.socialMediaType,
        purchaseDate: DateUtils.toLocalIsoString(new Date().toString()),
        employeeComments: this.employeeComments
      }

      console.log("toData: ", toData);

      this.API.stack(ROUTES.processTransactionSimpleProcessing, "POST", toData)
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              //this.companyDetails = response.data.companyDetails;

              this.dismissLoading();
            }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }
}