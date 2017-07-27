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
      super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

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
    this.days = Utils.getDays();
    this.presentLoading();

    // SUBSCRIBE TO FORM
    //this.myForm.valueChanges.subscribe(data => this.onChange(data, 'start'));    // all
    //this.myForm.get('dateRuleTimeEnd').valueChanges.subscribe(data => this.onChange(data, 'end'));    // all
   // this.myForm.get('hasExpiryDate').valueChanges.subscribe(data => this.onHasExpiryDateChanged(data));


    // get lkps
    this.API.stack(ROUTES.getLkpsIndividualRewardTypes + `/${this.auth.companyOid}`, "GET")
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
            }, this.errorHandler(this.ERROR_TYPES.API));
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
          setTimeout(() => {
            this.navCtrl.pop();
          }, 1000);
          console.log('response: ', response); 
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.ImageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.ImageUtility.getImgCordova().then((data) => {
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
      this.ImageUtility.uploadImg('upload-img-no-callback', myForm.img, this.imgSrc, ROUTES.uploadImgNoCallback).then((data) => {
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

    let expiryDate = this.myForm.controls.expiryDate.value.toString();
    
    /*** package ***/
    if (myForm.hasExpiryDate) this.myForm.patchValue({expiryDate: expiryDate.indexOf("T23:59:59") < 0 ? DateUtils.patchStartTime(this.myForm.controls.startDate.value) : expiryDate});
    const toData: ToDataSaveOrEditReward = {toData: this.myForm.value, companyOid: this.auth.companyOid, editOid: this.editOid};
    
    this.uploadImg(myForm).then(() => {
      this.API.stack(ROUTES.editRewardIndividual, "POST", toData)
        .subscribe(
            (response) => {
              console.log("response: ", response.data);
              this.dismissLoading(AppViewData.getLoading().saved);
              setTimeout(() => {
                this.navCtrl.pop();
              }, 1000);  
            }, this.errorHandler(this.ERROR_TYPES.API));
    });
  }
}
interface ToDataSaveOrEditReward {
  companyOid: number;
  toData: any;
  editOid: number;
}