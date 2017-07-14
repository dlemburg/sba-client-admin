import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { AppUtils } from '../../utils/app-utils';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { INameAndOid, AuthUserInfo, ILocation } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS } from '../../global/global';
import { AppStorage } from '../../global/app-storage';
import { ImageUtility } from '../../global/image-utility';


@IonicPage()
@Component({
  selector: 'page-edit-location',
  templateUrl: 'edit-location.html'
})
export class EditLocationPage extends BaseViewController {
  didPasswordChange: boolean = false;
  editValue: any = null;
  editOid: number = null;
  days: Array<string> = AppUtils.getDays();
  values: Array<INameAndOid> = [];
  myForm: FormGroup;
  selectedLocation: ILocation;
  isSubmitted: boolean;
  auth: AuthUserInfo;
  closedDaysArr: Array<number> = [];
  states: Array<string> = AppUtils.getStates();
  locations: Array<ILocation> = [];
  isCoordsSet: boolean = false;
  originalValue: string = null;
  imgSrc: string = null;
  img: string = null;
  oldImg: string = null;
  imgChanged: boolean = false;
  failedUploadImgAttempts = 0;
  initHasRun: boolean = false;
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
    super(alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.required],
      address: [null, Validators.compose([Validators.required, Validation.test('isStreetAddress')])],
      city: [null, Validators.required],
      state: [null, Validators.required],
      zipcode: [null, Validators.compose([Validators.required, Validation.test('isZipcode')])],
      phoneNumber: [null, Validators.compose([Validators.required, Validation.test('isPhoneNumber')])],
      coordsLat: [null],
      coordsLong: [null],
      sundayOpen: [null, Validators.required],
      sundayClose: [null, Validators.required],
      mondayOpen: [null, Validators.required],
      mondayClose: [null, Validators.required],
      tuesdayOpen: [null, Validators.required],
      tuesdayClose: [null, Validators.required],
      wednesdayOpen: [null, Validators.required],
      wednesdayClose: [null, Validators.required],
      thursdayOpen: [null, Validators.required],
      thursdayClose: [null, Validators.required],
      fridayOpen: [null, Validators.required],
      fridayClose: [null, Validators.required],
      saturdayOpen: [null, Validators.required],
      saturdayClose: [null, Validators.required],
      password: [null],
      password2: [null]
    }, {validator: Validation.isMismatch('password', 'password2')});
    this.auth = this.authentication.getCurrentUser();
  }

  ionViewDidLoad() {
     this.presentLoading();
     this.API.stack(ROUTES.getLocations + `/${this.auth.companyOid}`, "GET")
      .subscribe(
          (response) => {
            this.dismissLoading();
            console.log('response: ', response);
            this.locations = response.data.locations;
            this.values = response.data.locations;         // did this b/c already had call made and didn't want to do another call
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  // coords are set in a service b/c nav and subsequent pop of MapPage
  ionViewDidEnter() {
    if (this.initHasRun) {
      const latAndLong = AppStorage.getLatAndLong();
      if (latAndLong.coordsLat || latAndLong.coordsLong) {
        this.myForm.patchValue({
          coordsLat: latAndLong.coordsLat,
          coordsLong: latAndLong.coordsLong
        });
      }
    } else this.initHasRun = true;  
  }

  ionViewDidLeave() {
    AppStorage.setLatAndLong(null);
  }

  /* google maps */
  navMap() {
    this.navCtrl.push('MapPage');
  }

  // this is different b/c i had the call to get all location data already made, so just used it to save time
  editValueChange(): void {
    if (this.editValue && this.editValue.name) {
      this.myForm.patchValue({
        name: this.editValue.name,
        address: this.editValue.address,
        city: this.editValue.city,
        state: this.editValue.state,
        zipcode: this.editValue.zipcode,
        phoneNumber: this.editValue.phoneNumber,
        coordsLat: this.editValue.coordsLat,
        coordsLong: this.editValue.coordsLong,
        password: this.editValue.password,
        password2: this.editValue.password2,
        img: this.editValue.img
      });

      this.imgSrc = AppViewData.getDisplayImgSrc(this.editValue.img);
      this.oldImg = this.editValue.img;

      // edit value (location to edit) changed:  convert timeString to ISOString
      let days: any = {
          sundayOpen: this.editValue.sundayOpen,
          sundayClose: this.editValue.sundayClose,
          mondayOpen: this.editValue.mondayOpen,
          mondayClose: this.editValue.mondayClose,
          tuesdayOpen: this.editValue.tuesdayOpen,
          tuesdayClose: this.editValue.tuesdayClose,
          wednesdayOpen: this.editValue.wednesdayOpen,
          wednesdayClose: this.editValue.wednesdayClose,
          thursdayOpen: this.editValue.thursdayOpen,
          thursdayClose: this.editValue.thursdayClose,
          fridayOpen: this.editValue.fridayOpen,
          fridayClose: this.editValue.fridayClose,
          saturdayOpen: this.editValue.saturdayOpen,
          saturdayClose: this.editValue.saturdayClose
        };
        this.setTimesToIsoString(days);
    }
  }

  populateTimesWithAnotherLocation(): void {
      let days = {
        sundayOpen: this.selectedLocation.sundayOpen,
        sundayClose: this.selectedLocation.sundayClose,
        mondayOpen: this.selectedLocation.mondayOpen,
        mondayClose: this.selectedLocation.mondayClose,
        tuesdayOpen: this.selectedLocation.tuesdayOpen,
        tuesdayClose: this.selectedLocation.tuesdayClose,
        wednesdayOpen: this.selectedLocation.wednesdayOpen,
        wednesdayClose: this.selectedLocation.wednesdayClose,
        thursdayOpen: this.selectedLocation.thursdayOpen,
        thursdayClose: this.selectedLocation.thursdayClose,
        fridayOpen: this.selectedLocation.fridayOpen,
        fridayClose: this.selectedLocation.fridayClose,
        saturdayOpen: this.selectedLocation.saturdayOpen,
        saturdayClose: this.selectedLocation.saturdayClose
      };

      //  populate times location changed:   convert timeString to ISOString
      this.setTimesToIsoString(days);
  }

  onDidPasswordChange() {
    this.didPasswordChange = true;
  }
  
  setTimesToIsoString(days): void {
    let daysOfWeek = AppUtils.getDays();

    // loop through open/close
    daysOfWeek.forEach((x, index) => {
      let dayOpenKey = x.toLowerCase() + "Open";
      let dayCloseKey = x.toLowerCase() + "Close";

      if (days[dayOpenKey] === "closed") {
        this.myForm.patchValue({
          [dayOpenKey]: "closed",
          [dayCloseKey]: "closed"
        })
      } else {
        this.myForm.patchValue({
          [dayOpenKey]: DateUtils.convertTimeStringToIsoString(days[dayOpenKey]),
          [dayCloseKey]: DateUtils.convertTimeStringToIsoString(days[dayCloseKey])
        });
      }
      
    });
  }


  closedToggle(event, index): void {
    let days = AppUtils.getDays();
    let ctrlOpen = days[index].toLowerCase() + "Open";
    let ctrlClose = days[index].toLowerCase() + "Close";

    const filterclosedDaysArr = () => {
      return this.closedDaysArr.filter((x) => {
          return x !== index;
      });
    }

    if (!event.checked) {
      this.closedDaysArr = filterclosedDaysArr();

      this.myForm.patchValue({
        [ctrlOpen]: null,
        [ctrlClose]: null
      });
    } else {
     
      this.myForm.patchValue({
        [ctrlOpen]: "closed",
        [ctrlClose]: "closed"
      });
      this.closedDaysArr = [...this.closedDaysArr, index];
    }
  }

  remove() {
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeLocation + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
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
        img: `${CONST_APP_IMGS[18]}${this.myForm.controls["name"].value}$${this.auth.companyOid}`
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(): Promise<any> {
    let failedUploadImgAttempts = 0;

    this.presentLoading(AppViewData.getLoading().savingImg);
    return new Promise((resolve, reject) => {
      this.ImageUtility.uploadImg('upload-img-no-callback', this.img, this.imgSrc, ROUTES.uploadImgNoCallback).then((data) => {
        this.dismissLoading();
        resolve(data.message);
      })
      .catch((err) => {
        failedUploadImgAttempts++
        let message = "";
        this.dismissLoading();

        if (this.failedUploadImgAttempts === 1) {
            message = AppViewData.getToast().imgUploadErrorMessageFirstAttempt;
            reject(err);
        } else {
          message = AppViewData.getToast().imgUploadErrorMessageSecondAttempt;
          resolve();
        }
        this.presentToast(false, message);
      })
    })
  }
/*
  getImgCordova() {
    this.presentLoading("Retrieving...");
    const options: CameraOptions = {

      // used lower quality for speed
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
        this.img = CONST_APP_IMGS[18] + this.myForm.controls["name"].value + `$` + this.auth.companyOid;
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
  */


  submit(myForm, isValid: boolean): void {    

    // convert iso string back to time string. this always needs to happen before submitting.
    // 2 ways to create open/close time:   1.) pre-populate, 2.) choose from datepicker.  both need to be converted ISOString -> timeString
      myForm.sundayOpen = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.sundayOpen),
      myForm.sundayClose = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.sundayClose),
      myForm.mondayOpen = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.mondayOpen),
      myForm.mondayClose = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.mondayClose),
      myForm.tuesdayOpen = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.tuesdayOpen),
      myForm.tuesdayClose = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.tuesdayClose),
      myForm.wednesdayOpen = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.wednesdayOpen),
      myForm.wednesdayClose = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.wednesdayClose),
      myForm.thursdayOpen = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.thursdayOpen),
      myForm.thursdayClose = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.thursdayClose),
      myForm.fridayOpen = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.fridayOpen),
      myForm.fridayClose = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.fridayClose),
      myForm.saturdayOpen = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.saturdayOpen),
      myForm.saturdayClose = DateUtils.convertIsoStringToHoursAndMinutesString(myForm.saturdayClose)

      const toData: ToDataEditLocation = {toData: myForm, companyOid: this.auth.companyOid, editOid: this.editValue.oid, didPasswordChange: this.didPasswordChange};
     
      this.platform.ready().then(() => {
        this.uploadImg().then(() => {
          this.presentLoading(AppViewData.getLoading().saving);
          this.API.stack(ROUTES.editLocation, "POST", toData )
            .subscribe(
                (response) => {
                  this.dismissLoading(AppViewData.getLoading().saved);
                  this.navCtrl.pop();
                  console.log('response: ', response);
                }, this.errorHandler(this.ERROR_TYPES.API));
          });
      });
  }
}
interface ToDataEditLocation {
    toData: any;
    editOid: number;
    companyOid: number;
    didPasswordChange: boolean;
}