import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS, DEFAULT_IMG } from '../../global/global';
//import cloneDeep from 'lodash.cloneDeep';
//import { DomSanitizer } from '@angular/platform-browser';


@IonicPage()
@Component({
  selector: 'page-app-images',
  templateUrl: 'app-images.html'
})
export class AppImagesPage extends BaseViewController {
  type: string;
  isSubmitted: boolean = false;
  auth: AuthUserInfo;
  defaultImg: string = DEFAULT_IMG;
  currentIndex: number = null;
  values = [
    {label: "'My Card'", name: CONST_APP_IMGS[0], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "'Rewards'", name: CONST_APP_IMGS[1], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "'Order Ahead'", name: CONST_APP_IMGS[2], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "'Menu'", name: CONST_APP_IMGS[3], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Your Company Logo", name: CONST_APP_IMGS[4], img: null, imgSrc: null, targetWidth: 450,targetHeight: 150},
   // {label: "App Header Bar", name: CONST_APP_IMGS[5], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Default (fallback)", name: CONST_APP_IMGS[6], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Rewards (top of page)", name: CONST_APP_IMGS[7], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Login Background", name: CONST_APP_IMGS[8], img: null, imgSrc: null, targetWidth: 600,targetHeight: 900},
    {label: "Order Complete Background", name: CONST_APP_IMGS[9], img: null, imgSrc: null, targetWidth: 600,targetHeight: 900},
    {label: "Order Complete (middle of page)", name: CONST_APP_IMGS[10], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Mobile Card", name: CONST_APP_IMGS[11], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Added-To-Cart", name:CONST_APP_IMGS[12], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},


  ];
  editValue = {label: null, name: null, img: null, imgSrc: null, targetWidth: 423, targetHeight: 238};

 constructor(public navCtrl: NavController, 
             public navParams: NavParams,
             public API: API, 
             public authentication: Authentication,
             public modalCtrl: ModalController, 
             public alertCtrl: AlertController, 
             public toastCtrl: ToastController, 
             public loadingCtrl: LoadingController, 
             private camera: Camera, 
             private transfer: Transfer, 
             private file: File,
             private platform: Platform,
             /*private domSanitizer: DomSanitizer */) { 
    super(alertCtrl, toastCtrl, loadingCtrl);
   
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
  }

  editValueChange(value, index) {
    // do nothing right now
  }

  navExplanations() {
    let modal = this.modalCtrl.create('ExplanationsPage', {type: "app_images"}, {enableBackdropDismiss: true, showBackdrop: true})
    modal.present();
  }


  //  TODO
  // this.editValue.targetWidth, this.editValue.targetHeight
  // cordova
  getImgCordova() {
    this.presentLoading("Retrieving...");
    const options: CameraOptions = {

      // used lower quality for speed
      quality: 100,
      targetHeight: 400,
      targetWidth: 600,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: 2
    }

    this.platform.ready().then(() => {
      this.camera.getPicture(options).then((imageData) => {
        console.log("imageData, ", imageData);
       // this.appImg.imgSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(imageData);
       // don't need sanitizer b/c used [src] in template instead of src


        // sets name: $ acts as separator for server
        this.editValue.img = this.editValue.name + `$` + this.auth.companyOid;
        this.editValue.imgSrc = imageData;
        this.dismissLoading();
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(editValue): Promise<any> {
    console.log("inside cordova");
    return new Promise((resolve, reject) => {
        let options: FileUploadOptions = {
          fileKey: 'company-app-img',  // correlates to name in multer
          fileName: editValue.img,        
          headers: {}
        };
        const fileTransfer: TransferObject = this.transfer.create();
        let res = resolve;
        let rej = reject;

        fileTransfer.upload(editValue.imgSrc, ROUTES.uploadCompanyAppImg, options).then((data) => {
          console.log("uploaded successfully... resolving now...");
          res(data);
        })
        .catch((err) => {
          console.log("inside error");
          rej(err);
        });
       
      });
  }

  submit() {
    console.log("inside submit");
    this.presentLoading(AppViewData.getLoading().saving);
    this.platform.ready().then(() => {
        this.uploadImg(this.editValue).then((data) => {
        this.editValue = {label: null, name: null, img: null, imgSrc: null, targetWidth: 423, targetHeight: 238};
        this.dismissLoading(AppViewData.getLoading().saved);
      })
      .catch(this.errorHandler(this.ERROR_TYPES.API));
    })
  }
}

