import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { AppUtils } from '../../utils/app-utils';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, INameAndOid } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS, CONST_DISCOUNT_RULE, CONST_DISCOUNT_TYPE, CONST_PROCESSING_TYPE } from '../../global/global';

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
  PROCESSING_TYPE = CONST_PROCESSING_TYPE;
  DISCOUNT_TYPE = CONST_DISCOUNT_TYPE;
  DISCOUNT_RULE = CONST_DISCOUNT_RULE;
  lkps: any = {
    individualRewardTypes: []
  }
  doCallGetProducts: boolean = true;
  isSubmitted: boolean;
  editOid: number = null;
  values: Array<INameAndOid> = [];
  imgSrc: string = null;
  img: string = null;
  oldImg: string = null;
  imgChanged: boolean = false;
  failedUploadImgAttempts = 0;


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
    this.days = AppUtils.getDays();
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
          },this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));
  }

  getEditValues(): void {
    this.API.stack(ROUTES.getRewardsIndividualNameAndOid + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              this.dismissLoading();
              this.values = response.data.values;
              console.log('response.data: ', response.data);
            }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));
  }

  getRewardIndividual(): void {
    this.presentLoading();
    this.API.stack(ROUTES.getRewardIndividualToEdit + `/${this.editOid}`, "GET")
      .subscribe(
          (response) => {
            this.dismissLoading();
            let { name, img, description, exclusions, hasExpiryDate, expiryDate, isFreePurchaseItem, lkpRewardIndividualTypeOid } = response.data.reward;
            this.myForm.patchValue({
              name, 
              img, 
              description, 
              exclusions, 
              hasExpiryDate, 
              expiryDate: new Date(expiryDate).toISOString(), 
              isFreePurchaseItem, 
              lkpRewardIndividualTypeOid
            });

            // init everything
            this.imgSrc = AppViewData.getDisplayImgSrc(img);
            this.oldImg = img;
            this.onHasExpiryDateChanged(response.data.hasExpiryDate); 
            console.log('response.data: ', response.data);

          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  editValueChange(): void {
    if (this.editOid) this.getRewardIndividual();
  }

  navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "RewardsIndividual"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
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
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeRewardIndividual + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  getImgCordova() {
    this.presentLoading("Retrieving...");
    const options: CameraOptions = {

      quality: 100,
      targetHeight: 200,
      targetWidth: 300,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: 2
    }

    this.platform.ready().then(() => {
      this.camera.getPicture(options).then((imageData) => {
        console.log("imageData, ", imageData);

        this.imgChanged = true;
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
    return new Promise((resolve, reject) => {
        if (!this.imgChanged) {
          resolve();
        } else {
          this.presentLoading(AppViewData.getLoading().savingImg);

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


  submit(myForm): void {
    let expiryDate = this.myForm.controls.expiryDate.value.toString();
    
    /*** package ***/
    if (myForm.hasExpiryDate) this.myForm.patchValue({expiryDate: expiryDate.indexOf("T23:59:59") < 0 ? DateUtils.patchStartTime(this.myForm.controls.startDate.value) : expiryDate});
    const toData: ToDataSaveOrEditReward = {toData: this.myForm.value, companyOid: this.auth.companyOid, editOid: this.editOid};
    
    this.platform.ready().then(() => {
      this.uploadImg().then(() => {
        this.presentLoading(AppViewData.getLoading().saving);
        this.API.stack(ROUTES.editRewardIndividual, "POST", toData)
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
interface ToDataSaveOrEditReward {
  companyOid: number;
  toData: any;
  editOid: number;
}