import { Component } from '@angular/core';
import { API, ROUTES} from '../../global/api';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Authentication} from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, INameAndOid } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';


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
  GENERAL_TYPES = {
    CATEGORIES: "Categories"
  }
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
      name: [null, Validators.compose([Validators.required, Validators.maxLength(45)])],
      img: [null]
    });
  }

//this page uses: keyword, category, flavor, size, addons
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
    this.API.stack(ROUTES.removeGeneral, 'POST', {editOid: this.editOid, companyOid: this.auth.companyOid, type: this.type})
      .subscribe(
        (response) => {
          this.dismissLoading(AppViewData.getLoading().removed);
          setTimeout(() => {
            this.navCtrl.pop();
          }, 1000);          
          console.log('response: ', response); 
        },this.errorHandler(this.ERROR_TYPES.API));
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

  submit(myForm, isValid): void {
    
      this.presentLoading(AppViewData.getLoading().saving);
      let type: string = this.type.toLowerCase();
      
      if (type === "categories" && myForm.img) {
          this.uploadImg(myForm).then(() => {
            this.finishSubmit(type, myForm);
          }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD));
      } else this.finishSubmit(type, myForm);
  }

  finishSubmit(type, myForm) {
    const toData: ToDataEditGeneral = {toData: myForm, editOid: this.editOid, companyOid: this.auth.companyOid };

    this.API.stack(ROUTES.saveOwnerGeneralEdit + `/${this.type}`, 'POST', toData)
        .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
            setTimeout(() => {
              this.navCtrl.pop();
            }, 1000);            console.log('response: ', response);
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}

interface ToDataEditGeneral {
  toData: any;
  companyOid: number;
  editOid: number;
}