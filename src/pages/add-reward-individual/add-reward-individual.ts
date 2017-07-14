import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { AppUtils } from '../../utils/app-utils';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS, CONST_DISCOUNT_RULE, CONST_DISCOUNT_TYPE, CONST_PROCESSING_TYPE } from '../../global/global';
import { ImageUtility } from '../../global/image-utility';


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
  PROCESSING_TYPE = CONST_PROCESSING_TYPE;
  DISCOUNT_TYPE = CONST_DISCOUNT_TYPE;
  DISCOUNT_RULE = CONST_DISCOUNT_RULE;
  
  lkps: any = {
    individualRewardTypes: []
  }
  doCallGetProducts: boolean = true;
  isSubmitted: boolean;
  img: string = null;
  imgSrc: string = null;
  failedUploadImgAttempts: number = 0;
  ImageUtility: ImageUtility;

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
    this.days = AppUtils.getDays();
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
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "RewardsIndividual"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
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

   getImgCordova() {
    this.presentLoading("Retrieving...");
    this.ImageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.ImageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        img: `${CONST_APP_IMGS[17]}${this.myForm.controls["name"].value}$${this.auth.companyOid}`
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(): Promise<any> {
    let failedUploadImgAttempts = 0;

    this.presentLoading(AppViewData.getLoading().savingImg);
    return new Promise((resolve, reject) => {
      this.ImageUtility.uploadImg('upload-img-no-callback', this.img, this.imgSrc, ROUTES.uploadImgNoCallback).then((data) => {
        this.dismissLoading();
        resolve(data.message);
      })
      .catch((err) => {
        failedUploadImgAttempts++
        let message = "";
        this.dismissLoading();

        if (this.failedUploadImgAttempts === 1) {
            message = AppViewData.getToast().imgUploadErrorMessageFirstAttempt;
            reject(err);
        } else {
          message = AppViewData.getToast().imgUploadErrorMessageSecondAttempt;
          resolve();
        }
        this.presentToast(false, message);
      })
    })
  }


/*
    getImgCordova() {
      this.presentLoading("Retrieving...");
      const options: CameraOptions = {

        // used lower quality for speed
        quality: 100,
        targetHeight: 423,
        targetWidth: 238,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: 2
      }

      this.platform.ready().then(() => {
        this.camera.getPicture(options).then((imageData) => {
          console.log("imageData, ", imageData);

          this.imgSrc = imageData;
          this.img = CONST_APP_IMGS[17] + this.myForm.controls["name"].value + `$` + this.auth.companyOid;
          this.myForm.patchValue({
            img: this.img
          });
          this.dismissLoading();
        })
      })
      .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(): Promise<any> {
    this.presentLoading(AppViewData.getLoading().savingImg);

    return new Promise((resolve, reject) => {
        let options: FileUploadOptions = {
          fileKey: 'upload-img-no-callback', 
          fileName: this.img,        
          headers: {}
        };
        const fileTransfer: TransferObject = this.transfer.create();

        fileTransfer.upload(this.imgSrc, ROUTES.uploadImgNoCallback, options).then((data) => {
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
    });
  }
  */


  submit(myForm): void {
    this.platform.ready().then(() => {
      this.uploadImg().then(() => {

        /*** package ***/
        if (myForm.hasExpiryDate) this.myForm.patchValue({expiryDate: DateUtils.patchEndTime(this.myForm.controls.expiryDate.value)});
        this.presentLoading(AppViewData.getLoading().saving);
        const toData: ToDataSaveOrEditReward = {toData: myForm, companyOid: this.auth.companyOid};
        
        this.API.stack(ROUTES.saveRewardIndividual, "POST", toData)
          .subscribe(
              (response) => {
                this.dismissLoading(AppViewData.getLoading().saved);
                this.myForm.reset();
                this.img = null;
                this.imgSrc = null;
                this.failedUploadImgAttempts = 0;
              }, this.errorHandler(this.ERROR_TYPES.API));
      });
    });
  }
}
interface ToDataSaveOrEditReward {
  companyOid: number;
  toData: any;
}