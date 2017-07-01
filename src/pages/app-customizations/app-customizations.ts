import { Component } from '@angular/core';
import { Platform, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Validation } from '../../utils/validation-utils';
import { Authentication } from '../../global/authentication';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS } from '../../global/global';


@Component({
  selector: 'page-customizations',
  templateUrl: 'app-customizations.html'
})

// TODO: explanations
export class AppCustomizationsPage extends BaseViewController {
  type: string;
  myForm: FormGroup;
  isSubmitted: boolean = false;
  formDidChange: boolean = false;
  allFieldsEmptyOnEnter: boolean;
  auth: AuthUserInfo;
  customizations: Array<any> = [];
  img: string = null;
  oldImg: string = null;
  imgSrc: string = null;
  imgDidChange: boolean = false;
  failedUploadImgAttempts: number = 0;


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
    super(alertCtrl, toastCtrl, loadingCtrl);
   
    this.myForm = this.formBuilder.group({
      hasDairy: [false],
      hasSweetener: [false],
      hasVariety: [false],
      hasFlavors: [false],
      hasAddons: [false],
      doesChargeForDairy: [false],
      doesChargeForAddons: [false],
      hasRewardIndividualBirthday: [false],
      hasRewardIndividualFirstMobileCardUpload: [false],
      //hasRewardIndividualPointsThreshold: [false],
     // defaultProductHealthWarning: [null],
     // defaultRewardsExclusionsMessage: [null],
     // defaultOrderAheadExclusionsMessage: [null],
      customCompanyEmailReloadMessage: [" "],
      customCompanyEmailReceiptMessage: [" "],
      customCompanyEmailFooterMessage: [" "],
      hasSocialMediaRewards: [false],
      socialMediaBonusPoints: [0, Validation.test("isNumbersOnly")],
      socialMediaMessage: [null],
      hasFacebook: [false],
      hasTwitter: [false],
      hasInstagram: [false],
      pointsThreshold: [0, Validation.test("isNumbersOnly")],
      pointsPerFiftyCents: [0, Validation.test("isNumbersOnly")],
      hasPrinter: [false],
      acceptsPartialPayments: [false]
    });
  }

  ionViewDidLoad() {
    this.myForm.valueChanges.subscribe(data => this.onFormChange(data));    // all
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();

    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              this.dismissLoading();

              /* new way of handling- may be bugs */
              this.patchForm(this.myForm.controls.value, response.data.companyDetails);
              
              this.oldImg = response.data.companyDetails.socialMediaImg;
              this.imgSrc = AppViewData.getDisplayImgSrc(response.data.companyDetails.socialMediaImg);
            }, this.errorHandler(this.ERROR_TYPES.API));
  }

  patchForm(myForm, companyDetails) {
    for (let x in companyDetails) {
      if (x in myForm) {
        this.myForm.patchValue({
          [x]: companyDetails[x]
        });
      }
    }
  }

  onFormChange(data) {
    this.formDidChange = true;
  }

  navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "app_customizations"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
  }


  getImgCordova() {
    this.presentLoading("Retrieving...");
    const options: CameraOptions = {

      // used lower quality for speed
      quality: 100,
      targetHeight: 238,
      targetWidth: 423,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: 2
    }

    this.platform.ready().then(() => {
      this.camera.getPicture(options).then((imageData) => {
        console.log("imageData, ", imageData);

        this.imgSrc = imageData;
        this.img = CONST_APP_IMGS[13] + `$` + this.auth.companyOid;
        this.imgDidChange = true;
        this.myForm.patchValue({
          socialMediaImg: this.img
        });
        this.dismissLoading();
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(): Promise<any> {
    this.presentLoading(AppViewData.getLoading().savingImg);

    return new Promise((resolve, reject) => {

      if (!this.imgDidChange) {
        resolve();
      } else {
        let options: FileUploadOptions = {
          fileKey: 'upload-img-and-unlink', 
          fileName: this.img,        
          headers: {}
        };
        const fileTransfer: TransferObject = this.transfer.create();

        fileTransfer.upload(this.imgSrc, ROUTES.uploadImgAndUnlink + `/${this.oldImg}`, options).then((data) => {
          console.log("uploaded successfully... ");
          this.dismissLoading();
          resolve();
        })
        .catch((err) => {
            let message = "";
            let shouldPopView = false;
            this.failedUploadImgAttempts++;
            this.dismissLoading();

            if (this.failedUploadImgAttempts === 1) {
               message = AppViewData.getToast().imgUploadErrorMessageFirstAttempt;
               reject(err);
            } else {
              message = AppViewData.getToast().imgUploadErrorMessageSecondAttempt;
              resolve();
            }
            this.presentToast(shouldPopView, message);
        });
      }
    });
  }




  submit(myForm: FormControl, isValid: boolean) {
    if (this.formDidChange || this.imgDidChange) {
      this.platform.ready().then(() => {
        this.uploadImg().then(() => {

          /* package */
          this.presentLoading();
          let toData = { toData: myForm, companyOid: this.auth.companyOid };

          this.API.stack(ROUTES.saveCompanyDetails, "POST", toData)
            .subscribe(
                (response) => {
                  console.log("response: ", response.data);
                  this.dismissLoading(AppViewData.getLoading().saved);
                  this.navCtrl.pop();
                },this.errorHandler(this.ERROR_TYPES.API));
          });
        });
    }
  }
}


/*
              this.myForm.patchValue({
                hasDairy: response.data.companyDetails.hasDairy,
                hasSweetener: response.data.companyDetails.hasSweetener,
                hasVariety: response.data.companyDetails.hasVariety,
                hasFlavors: response.data.companyDetails.hasFlavors,
                hasAddons: response.data.companyDetails.hasAddons,
                doesChargeForDairy: response.data.companyDetails.doesChargeForDairy,
                doesChargeForAddons: response.data.companyDetails.doesChargeForAddons,
                hasRewardIndividualBirthday: response.data.companyDetails.hasRewardIndividualBirthday,
                hasRewardIndividualFirstMobileCardUpload: response.data.companyDetails.hasRewardIndividualFirstMobileCardUpload,
               // hasRewardIndividualPointsThreshold: response.data.companyDetails.hasRewardIndividualPointsThreshold,
                defaultProductHealthWarning: response.data.companyDetails.defaultProductHealthWarning,
                defaultRewardsExclusionsMessage: response.data.companyDetails.defaultRewardsExclusionsMessage,
                defaultOrderAheadExclusionsMessage: response.data.companyDetails.defaultOrderAheadExclusionsMessage,
                customCompanyEmailReloadMessage: response.data.companyDetails.customCompanyEmailReloadMessage,
                customCompanyEmailReceiptMessage: response.data.companyDetails.customCompanyEmailReceiptMessage,
                hasSocialMediaRewards: response.data.companyDetails.hasSocialMediaRewards,
                socialMediaDiscountAmountPercent: response.data.companyDetails.socialMediaDiscountAmountPercent,
                socialMediaMessage: response.data.companyDetails.socialMediaMessage,
                socialMediaImg: response.data.compamnyDetails.socialMediaImg,
                hasFacebook: response.data.companyDetails.hasFacebook,
                hasTwitter: response.data.companyDetails.hasTwitter,
                hasInstagram: response.data.companyDetails.hasInstagram,
                pointsThreshold: response.data.companyDetails.pointsThreshold,
                pointsPerFiftyCents: response.data.companyDetails.pointsPerFiftyCents,
                hasPrinter: response.data.companyDetails.hasPrinter,
                acceptsPartialPayments: response.data.companyDetails.acceptsPartialPayments
              });
              */