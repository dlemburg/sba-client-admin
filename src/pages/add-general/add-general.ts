import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS } from '../../global/global';


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
    super(alertCtrl, toastCtrl, loadingCtrl);

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
    const options: CameraOptions = {

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
        this.img = CONST_APP_IMGS[14] + this.myForm.controls["name"].value + `$` + this.auth.companyOid;
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



  submit(myForm, isValid): void {
    let type: string = this.type.toLowerCase();

    if (type === "categories") {
      this.platform.ready().then(() => {
        this.uploadImg().then(() => {
          this.finishSubmit(type, myForm);
        });
      });

    } else {
      this.finishSubmit(type, myForm);
    }
  }

  finishSubmit(type: string, myForm):void {
    this.presentLoading(AppViewData.getLoading().saving);
    this.API.stack(ROUTES.saveOwnerGeneralAdd + `/${type}`, 'POST', {toData: myForm, isEdit: false, companyOid: this.auth.companyOid })
      .subscribe(
        (response) => {
          console.log('response: ', response);
          this.dismissLoading(AppViewData.getLoading().saved);
          this.myForm.reset();
          this.img = null;
          this.imgSrc = null;
          this.failedUploadImgAttempts = 0;
        }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
