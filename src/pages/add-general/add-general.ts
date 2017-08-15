import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';

@IonicPage()
@Component({
  selector: 'page-add-general',
  templateUrl: 'add-general.html'
})
export class AddGeneralPage extends BaseViewController {
  type: string;
  myForm: FormGroup;
  auth: AuthUserInfo;
  img: string = null;
  imgSrc: string = null;
  failedUploadImgAttempts: number = 0;
  imageUtility: ImageUtility;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public API: API, 
    public authentication: Authentication, 
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
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45) ]) /*, this.AsyncValidation.isNameNotUniqueAsync(this.type) */],
      img: [null]
    });
  }

  ionViewDidLoad() {
    this.type = this.navParams.data.type;
    this.auth = this.authentication.getCurrentUser();
  }

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

  submit(myForm, isValid): void {
    this.presentLoading(AppViewData.getLoading().saving);
    let type: string = this.type.toLowerCase();
    
    if (type === "categories" && myForm.img) {
        this.uploadImg(myForm).then(() => {
          this.finishSubmit(type, myForm);
        }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD));
    } else this.finishSubmit(type, myForm);
  
  }

  finishSubmit(type: string, myForm):void {
    this.API.stack(ROUTES.saveOwnerGeneralAdd + `/${type}`, 'POST', {toData: myForm, companyOid: this.auth.companyOid })
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.dismissLoading(AppViewData.getLoading().saved);
          setTimeout(() => {
            this.myForm.reset();
            this.img = null;
            this.imgSrc = null;
          }, 500);  
        }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
