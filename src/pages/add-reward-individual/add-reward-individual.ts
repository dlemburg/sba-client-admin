import { Component } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_DISCOUNT_RULE, CONST_DISCOUNT_TYPE, CONST_PROCESSING_TYPE } from '../../global/global';
import { ImageUtility } from '../../global/image-utility';
import { DateUtils } from '../../utils/date-utils';
import { Utils } from '../../utils/utils';

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
  
  individualRewardTypes:Array<any> = [];
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
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

     this.myForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45), Validators.minLength(2)])],
      img: [null],
      description: [null, Validators.compose([Validators.required, Validators.maxLength(200)])],
      exclusions: [null, Validators.compose([Validators.maxLength(200)])],
      individualRewardType: [null, Validators.required],
    /*  hasExpiryDate: [false, Validators.required], */
     // isFreePurchaseItem: [true, Validators.required],
     // expiryDate: [null]
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

    this.API.stack(ROUTES.getRewardsIndividualAvailable + `/${this.auth.companyOid}`, "GET")
      .subscribe(
          (response) => {
            this.dismissLoading();
            this.individualRewardTypes = response.data.individualRewardTypes;
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
    /*** package ***/
    let expiryDate = myForm.expiryDate ? myForm.expiryDate.toString() : null;
    if (myForm.hasExpiryDate)  myForm.expiryDate = expiryDate.indexOf("T23:59:59") < 0 ? DateUtils.patchEndTime(myForm.expiryDate) : expiryDate;
    this.presentLoading(AppViewData.getLoading().saving);

    if (myForm.img) {
      this.uploadImg(myForm).then(() => {
        this.finishSubmit(myForm);
      }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD));
    } else this.finishSubmit(myForm);
  }

  finishSubmit(myForm) {
    const toData: ToDataSaveOrEditReward = {toData: myForm, companyOid: this.auth.companyOid};

    this.API.stack(ROUTES.saveRewardIndividual, "POST", toData)
      .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
            setTimeout(() => {
             this.navCtrl.pop();
            }, 500);  
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
interface ToDataSaveOrEditReward {
  companyOid: number;
  toData: any;
}