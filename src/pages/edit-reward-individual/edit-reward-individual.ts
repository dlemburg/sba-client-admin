import { Component } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, INameAndOid } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_DISCOUNT_RULE, CONST_DISCOUNT_TYPE, CONST_PROCESSING_TYPE } from '../../global/global';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';

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
  individualRewardTypes: Array<string> = [];
  doCallGetProducts: boolean = true;
  isSubmitted: boolean;
  editOid: number = null;
  values: Array<INameAndOid> = [];
  imgSrc: string = null;
  img: string = null;
  oldImg: string = null;
  imgDidChange: boolean = false;
  failedUploadImgAttempts = 0;
  imageUtility: ImageUtility;
  rewardIndividual: any;
  rewardsIndividual: Array<any> = [];

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
        name: ['', Validators.compose([Validators.required, Validators.maxLength(45)])],
        img: [''],
        description: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
        exclusions: ['', Validators.compose([Validators.maxLength(200)])],
        individualRewardType: [null, Validators.required],
      });
  }

  ionViewDidLoad() {
    this.myForm.get('img').valueChanges.subscribe((data) => { this.onImgDidChange(data)});
    this.auth = this.authentication.getCurrentUser();
    this.days = Utils.getDays();
    this.presentLoading();
    // get all rewardsIndividual that the company has
    this.API.stack(ROUTES.getRewardsIndividual + `/${this.auth.companyOid}`, "GET")
      .subscribe(
          (response) => {
            this.rewardsIndividual = response.data.rewardsIndividual;
            console.log('response.data: ', response.data);
            this.dismissLoading();
          },this.errorHandler(this.ERROR_TYPES.API));
  }


  /*
  getRewardIndividual(): void {
    this.presentLoading();
    this.API.stack(ROUTES.getRewardIndividualToEdit + `${this.auth.companyOid}/${this.editOid}`, "GET")
      .subscribe(
          (response) => {
            this.dismissLoading();
            let { name, img, description, exclusions, hasExpiryDate, expiryDate, isFreePurchaseItem, individualRewardType } = response.data.individualReward;
            this.myForm.patchValue({
              name, 
              img, 
              description, 
              exclusions, 
              hasExpiryDate, 
              expiryDate: new Date(expiryDate).toISOString(), 
              isFreePurchaseItem, 
              individualRewardType
            });

            // init everything
            this.imgSrc = AppViewData.getDisplayImgSrc(img);
            this.oldImg = img;
            this.onHasExpiryDateChanged(response.data.hasExpiryDate); 
            console.log('response.data: ', response.data);

          }, this.errorHandler(this.ERROR_TYPES.API));
  }
        */

  editValueChange(): void {
    if (this.rewardIndividual) {
      this.myForm.patchValue({
        name: this.rewardIndividual.name, 
        img: this.rewardIndividual.img, 
        description: this.rewardIndividual.description, 
        exclusions: this.rewardIndividual.exclusions, 
        hasExpiryDate: this.rewardIndividual.hasExpiryDate, 
        expiryDate: new Date(this.rewardIndividual.expiryDate).toISOString(), 
        isFreePurchaseItem: this.rewardIndividual.isFreePurchaseItem, 
        individualRewardType: this.rewardIndividual.individualRewardType
      });
      this.editOid = this.rewardIndividual.oid;
      this.imgSrc = AppViewData.getDisplayImgSrc(this.rewardIndividual.img);
    }
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
          setTimeout(() => this.navCtrl.pop(), 1000);
          console.log('response: ', response); 
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  onImgDidChange(data) { this.imgDidChange = true }

  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.imageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.imageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        img: Utils.generateImgName({appImgIndex: 14, name: this.myForm.controls["name"].value, companyOid: this.auth.companyOid})
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(myForm): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageUtility.uploadImg('upload-img-no-callback', myForm.img, this.imgSrc, ROUTES.uploadImgNoCallback).then((data) => {
        resolve();
      })
      .catch((err) => {
        console.log("catch from upload img");
        reject(err);
      })
    })
  }

  submit(myForm): void {
    this.presentLoading(AppViewData.getLoading().saving);
    //let expiryDate = myForm.expiryDate ? myForm.expiryDate.toString() : null;
    
    /*** package ***/
    if (myForm.hasExpiryDate)  myForm.expiryDate = myForm.xpiryDate.indexOf("T23:59:59") < 0 ? DateUtils.patchEndTime(myForm.expiryDate) : myForm.expiryDate;
    
    if (myForm.img && this.imgDidChange) {
      this.uploadImg(myForm).then(() => {
        this.finishSubmit(myForm);
      }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD));
    } else this.finishSubmit(myForm);
  }

  finishSubmit(myForm) {
    const toData: ToDataSaveOrEditReward = {toData: this.myForm.value, companyOid: this.auth.companyOid, editOid: this.editOid};

    console.log("toData: ", toData);
    this.API.stack(ROUTES.editRewardIndividual, "POST", toData)
      .subscribe(
        (response) => {
          console.log("response: ", response.data);
          this.dismissLoading(AppViewData.getLoading().saved);
          setTimeout(() => this.navCtrl.pop(), 1000);  
        }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
interface ToDataSaveOrEditReward {
  companyOid: number;
  toData: any;
  editOid: number;
}