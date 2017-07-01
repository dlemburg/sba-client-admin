import { Component } from '@angular/core';
import { API, ROUTES} from '../../global/api';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Authentication} from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, INameAndOid } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS } from '../../global/global';


@IonicPage()
@Component({
  selector: 'page-edit-general',
  templateUrl: 'edit-general.html'
})
export class EditGeneralPage extends BaseViewController {
  auth: AuthUserInfo;
  type: string;
  myForm: FormGroup;
  editValue: any;
  isSubmitted: boolean;
  editOid: number = null;
  values: Array<INameAndOid> = [];
  img: string = null;
  oldImg: string = null;
  imgSrc: string = null;
  imgChanged: boolean = false;
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
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      img: [null]
    });
  }

//t this page uses: keyword, category, flavor, size, add-on
  ionViewDidLoad() {
    this.type = this.navParams.data.type;
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();

    const route = this.type === "categories" ? ROUTES.getOwnerCategories : ROUTES.getOwnerEditGeneral
    this.API.stack(route + `/${this.type.toLowerCase()}/${this.auth.companyOid}`, 'GET')
      .subscribe(
        (response) => {
          this.dismissLoading();
          console.log('response: ', response); 
          this.values = response.data.values;
        }, this.errorHandler(this.ERROR_TYPES.API));
  }

  editValueChange(event, value): void {
    if (this.editValue && this.editValue.name) {
      if (this.type === "categories") {

        // init everything
        this.myForm.patchValue({name: this.editValue.name, img: this.editValue.img});
        this.imgSrc = AppViewData.getDisplayImgSrc(this.editValue.img);
        this.oldImg = this.editValue.img;

      } else this.myForm.patchValue({name: this.editValue.name});

      this.editOid = this.editValue.oid;
    }
  }

  remove(): void {
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeGeneral + `/${this.type}/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        },this.errorHandler(this.ERROR_TYPES.API));
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
        this.img = CONST_APP_IMGS[14] + this.myForm.controls["name"].value + `$` + this.auth.companyOid;
        this.imgChanged = true;
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

      if (!this.imgChanged) {
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

  submit(myForm, isValid): void {
    this.platform.ready().then(() => {
      this.uploadImg().then(() => {
        this.presentLoading(AppViewData.getLoading().saving);
        const toData: ToDataEditGeneral = {toData: myForm, editOid: this.editOid, companyOid: this.auth.companyOid };
        
        this.API.stack(ROUTES.saveOwnerGeneralEdit + `/${this.type}`, 'POST', toData)
          .subscribe(
            (response) => {
              this.dismissLoading(AppViewData.getLoading().saved);
              this.navCtrl.pop();
              console.log('response: ', response);
            },this.errorHandler(this.ERROR_TYPES.API));
      });
    });
  }
}
interface ToDataEditGeneral {
  toData: any;
  companyOid: number;
  editOid: number;
}