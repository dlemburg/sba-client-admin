import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { INameAndOid, AuthUserInfo, ILocation } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';
import { CONST_NODE_MULTER_ACTIONS } from '../../global/global';

import { Geolocation } from '@ionic-native/geolocation';

@IonicPage()
@Component({
  selector: 'page-edit-location',
  templateUrl: 'edit-location.html'
})
export class EditLocationPage extends BaseViewController {
  didPasswordChange: boolean = false;
  editValue: any = null;
  editOid: number = null;
  days: Array<string> = Utils.getDays();
  values: Array<INameAndOid> = [];
  myForm: FormGroup;
  selectedLocationToPopulateHours: ILocation;
  isSubmitted: boolean;
  auth: AuthUserInfo;
  closedDaysArr: Array<number> = [];
  states: Array<string> = Utils.getStatesAbbreviated();
  locations: Array<ILocation> = [];
  isCoordsSet: boolean = false;
  originalValue: string = null;
  imgSrc: string = null;
  img: string = null;
  oldImg: string = null;
  imgDidChange: boolean = false;
  failedUploadImgAttempts = 0;
  initHasRun: boolean = false;
  imageUtility: ImageUtility;
  isMapLoading: boolean = false;

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
  private geolocation: Geolocation, 
  private file: File,
  private platform: Platform) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

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
      password2: [null],
      img: [null]
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
      const latAndLong = AppViewData.getLatAndLong();
      if (latAndLong.coordsLat && latAndLong.coordsLong) {
        this.myForm.patchValue({
          coordsLat: latAndLong.coordsLat.toFixed(7),
          coordsLong: latAndLong.coordsLong.toFixed(7)
        });
      }
    } else this.initHasRun = true;  
  }

  ionViewDidLeave() {
    this.isMapLoading ? this.dismissLoading() : null;
    this.isMapLoading = false;
    AppViewData.setLatAndLong(null);
  }

 /* geolocation */
  getCurrentPosition(): Promise<{coordsLat: number, coordsLong: number}> {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition().then((data) => {
        const coordsLat = +data.coords.latitude.toFixed(7);
        const coordsLong = +data.coords.longitude.toFixed(7);
        resolve({coordsLat, coordsLong});
      })
      .catch((err) => reject(err));
    })
  }

  /* google maps */
  navMap() {
    this.isMapLoading = true;
    this.presentLoading();
    this.getCurrentPosition().then((data) => {
      let currentLocation = {coordsLat: data.coordsLat, coordsLong: data.coordsLong};
      console.log("currentLocation: ", currentLocation);
      this.navCtrl.push('MapPage', {currentLocation});
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.GEOLOCATION));
    
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
        password: null,
        password2: null,
        img: this.editValue.img
      });

      this.imgSrc = AppViewData.getDisplayImgSrc(this.editValue.img);
      this.oldImg = this.editValue.img;
      this.setTimesToIsoString(this.editValue);
    }
  }

  populateTimesWithAnotherLocation(): void {
    //  populate times location changed:   convert timeString to ISOString
    this.setTimesToIsoString(this.selectedLocationToPopulateHours);
  }

  onDidPasswordChange() {
    this.didPasswordChange = true;
  }
  
  setTimesToIsoString(selectedLocation): void {
    this.myForm.patchValue({
      sundayOpen : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.sundayOpen),
      sundayClose : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.sundayClose),
      mondayOpen : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.mondayOpen),
      mondayClose : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.mondayClose),
      tuesdayOpen : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.tuesdayOpen),
      tuesdayClose : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.tuesdayClose),
      wednesdayOpen : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.wednesdayOpen),
      wednesdayClose : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.wednesdayClose),
      thursdayOpen : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.thursdayOpen),
      thursdayClose : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.thursdayClose),
      fridayOpen : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.fridayOpen),
      fridayClose : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.fridayClose),
      saturdayOpen : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.saturdayOpen),
      saturdayClose : DateUtils.convertIsoStringToHoursAndMinutesString(selectedLocation.saturdayClose)
    })
  }

  closedToggle(event, index): void {
    let days = Utils.getDays();
    let ctrlOpen = days[index].toLowerCase() + "Open";
    let ctrlClose = days[index].toLowerCase() + "Close";

    const filterclosedDaysArr = () => this.closedDaysArr.filter((x) => x !== index);

    if (!event.checked) {
      this.closedDaysArr = filterclosedDaysArr();
      this.myForm.patchValue({ [ctrlOpen]: null, [ctrlClose]: null });
    } else {
      this.myForm.patchValue({[ctrlOpen]: "closed", [ctrlClose]: "closed"});
      this.closedDaysArr = [...this.closedDaysArr, index];
    }
  }

  remove() {
    this.presentLoading(AppViewData.getLoading().removing);
    this.API.stack(ROUTES.removeLocation + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
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
        img: Utils.generateImgName({appImgIndex: 18, name: this.myForm.controls["name"].value, companyOid: this.auth.companyOid})
      });
      this.imgDidChange = true;
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  uploadImg(myForm): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageUtility.uploadImg(CONST_NODE_MULTER_ACTIONS.UPLOAD_IMG_AND_UNLINK, myForm.img, this.imgSrc, ROUTES.uploadImgAndUnlink + `/${this.oldImg}`).then((data) => {
        resolve();
      })
      .catch((err) => {
        console.log("catch from upload img");
        reject(err);
      })
    })
  }

  finishSubmit(myForm) {
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
    this.API.stack(ROUTES.editLocation, "POST", toData )
      .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
            setTimeout(() => this.navCtrl.pop(), 1000);
            console.log('response: ', response);
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  submit(myForm, isValid: boolean): void {    
    this.presentLoading(AppViewData.getLoading().saving);
    if (myForm.img && this.imgDidChange) {
      this.uploadImg(myForm).then(() => {
        this.finishSubmit(myForm);
      }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD))
    } else this.finishSubmit(myForm);
  }
}
interface ToDataEditLocation {
    toData: any;
    editOid: number;
    companyOid: number;
    didPasswordChange: boolean;
}


    



/* loop through open/close
        let daysOfWeek = Utils.getDays();

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
  */