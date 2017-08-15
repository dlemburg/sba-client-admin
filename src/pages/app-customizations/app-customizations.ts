import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
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
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';

@IonicPage()
@Component({
  selector: 'page-customizations',
  templateUrl: 'app-customizations.html'
})

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
      socialMediaPointsBonus: [0, Validation.test("isNumbersOnly")],
      hasFacebook: [false],
      hasTwitter: [false],
      hasInstagram: [false],
      socialMediaMessageInstagram: [null],
      socialMediaMessageFacebook: [null],
      socialMediaMessageTwitter: [null],
      socialMediaImg: [null],
      pointsThreshold: [0, Validation.test("isNumbersOnly")],
      pointsPerDollar: [0, Validation.test("isNumbersOnly")],
      hasPrinter: [false],
      acceptsPartialPayments: [false],
      homeScreenMyMobileCardSubtitle: [null],
      homeScreenRewardsSubtitle: [null],
      homeScreenOrderAheadSubtitle: [null],
      homeScreenMenuSubtitle: [null]
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
              this.patchForm(this.myForm.value, response.data.companyDetails);
              
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
    this.imageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.imageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        socialMediaImg: Utils.generateImgName({appImgIndex: 13, name: this.myForm.controls["socialMediaImg"].value, companyOid: this.auth.companyOid})
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(myForm): Promise<any> {
    return new Promise((resolve, reject) => {

      let route = this.oldImg ? ROUTES.uploadImgAndUnlink + `/${this.oldImg}` : ROUTES.uploadImgNoCallback;
      let action = this.oldImg ? 'upload-img-and-unlink' : 'upload-img-no-callback';

     
      this.imageUtility.uploadImg(action, myForm.socialMediaImg, this.imgSrc, route).then((data) => {
        resolve();
      })
      .catch((err) => {
        console.log("catch from upload img");
        reject(err);
      })
    })
  }


  submit(myForm, isValid: boolean) {
    if (this.formDidChange || this.imgDidChange) {
      this.presentLoading(AppViewData.getLoading().saving);
      
      if (myForm.socialMediaImg) {
        this.uploadImg(myForm).then(() => {
          this.finishSubmit(myForm);
        }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD))
      } else this.finishSubmit(myForm);
    }
  }

  finishSubmit(myForm) {
    let toData = { toData: myForm, companyOid: this.auth.companyOid };
     this.API.stack(ROUTES.saveCompanyDetails, "POST", toData)
        .subscribe(
            (response) => {
              console.log("response: ", response.data);
              this.dismissLoading(AppViewData.getLoading().saved);
              setTimeout(() => {
                this.navCtrl.pop();
              }, 500)
            }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
