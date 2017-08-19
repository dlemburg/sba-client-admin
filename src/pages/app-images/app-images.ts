import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS, DEFAULT_IMG } from '../../global/global';
//import cloneDeep from 'lodash.cloneDeep';
//import { DomSanitizer } from '@angular/platform-browser';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';


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
    {label: "My Card", name: CONST_APP_IMGS[0], appImgIndex: 0, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Rewards", name: CONST_APP_IMGS[1], appImgIndex: 1, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Order Ahead", name: CONST_APP_IMGS[2], appImgIndex: 2, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Menu", name: CONST_APP_IMGS[3], appImgIndex: 3, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Your Company Logo", name: CONST_APP_IMGS[4], appImgIndex: 4, img: null, imgSrc: null, targetWidth: 450,targetHeight: 150},
   // {label: "App Header Bar", name: CONST_APP_IMGS[5], img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Default (fallback)", name: CONST_APP_IMGS[6], appImgIndex: 6, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Rewards (top of page)", name: CONST_APP_IMGS[7], appImgIndex: 7, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Login Background", name: CONST_APP_IMGS[8], appImgIndex: 8, img: null, imgSrc: null, targetWidth: 600,targetHeight: 900},
    {label: "Order Complete Background", name: CONST_APP_IMGS[9], appImgIndex: 9, img: null, imgSrc: null, targetWidth: 600,targetHeight: 900},
    {label: "Order Complete (middle of page)", name: CONST_APP_IMGS[10], appImgIndex: 10, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Mobile Card", name: CONST_APP_IMGS[11], appImgIndex: 11, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
    {label: "Added-To-Cart", name: CONST_APP_IMGS[12], appImgIndex: 12, img: null, imgSrc: null, targetWidth: 450,targetHeight: 250},
  ];
  editValue = {targetWidth: 423, targetHeight: 238, label: null, appImgIndex: null, name: null, img: null, imgSrc: null};
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
  private camera: Camera, 
  private transfer: Transfer, 
  private file: File,
  private platform: Platform,
  /*private domSanitizer: DomSanitizer */) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
   
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

  /*this.editValue.label.replace(/\s+/g, '-') */
  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.imageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.imageUtility.getImgCordova({targetHeight: this.editValue.targetHeight, targetWidth: this.editValue.targetWidth}).then((data) => {
      this.dismissLoading();
      this.editValue.imgSrc = data.imageData;
      this.editValue.img = Utils.generateImgName({appImgIndex: this.editValue.appImgIndex, name: "", companyOid: this.auth.companyOid});

      console.log("this.editValue.imgSrc: ", this.editValue.imgSrc);
      console.log("this.editValue.img: ", this.editValue.img);
    }).catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(myForm): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageUtility.uploadImg('company-app-img', this.editValue.img, this.editValue.imgSrc, ROUTES.uploadCompanyAppImg).then((data) => {
        resolve();
      })
      .catch((err) => {
        console.log("catch from upload img");
        reject(err);
      })
    })
  }
  

  submit() {
    console.log("inside submit");
    this.presentLoading(AppViewData.getLoading().saving);

    this.uploadImg(this.editValue).then((data) => {
      this.editValue = {label: null, appImgIndex: null, name: null, img: null, imgSrc: null, targetWidth: 423, targetHeight: 238};
      this.dismissLoading(AppViewData.getLoading().saved);
    })
    .catch(this.errorHandler(this.ERROR_TYPES.API));
  }
}

