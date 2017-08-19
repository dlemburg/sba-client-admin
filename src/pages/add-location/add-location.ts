import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, ILocation } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';
import { Geolocation } from '@ionic-native/geolocation';


@IonicPage()
@Component({
  selector: 'page-add-location',
  templateUrl: 'add-location.html'
})
export class AddLocationPage extends BaseViewController {
  days: Array<string> = Utils.getDays();
  myForm: FormGroup;
  selectedLocationToPopulateHours: ILocation;
  isSubmitted: boolean;
  auth: AuthUserInfo;
  closedDaysArr: Array<number> = [];
  initHasRun: boolean = false;
  states: Array<string> = Utils.getStates();
  locations: Array<ILocation> = [];
  isCoordsSet: boolean = false;
  imgSrc: string = null;
  img: string = null;
  failedUploadImgAttempts = 0;
  imageUtility: ImageUtility;
  isLocationHoursPopulated: boolean = false;
  isMapLoading: boolean = false;

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
    private geolocation: Geolocation,
    private platform: Platform) { 

    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.required],
      address: [null, Validators.compose([Validators.required, Validation.test("isStreetAddress")])],
      city: [null, Validators.required],
      state: ['California', Validators.required],
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
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.auth = this.authentication.getCurrentUser();
    
    this.API.stack(ROUTES.getLocations + `/${this.auth.companyOid}`, "GET")
      .subscribe(
          (response) => {
            console.log('response: ', response);
            this.locations = response.data.locations;
            this.dismissLoading();
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  // coords are set in a service b/c nav and subsequent pop of MapPage
  ionViewDidEnter() {
    if (this.initHasRun) {
      const latAndLong = AppViewData.getLatAndLong();
      if (latAndLong.coordsLat && latAndLong.coordsLong) {
        this.myForm.patchValue({
          coordsLat: latAndLong.coordsLat.toFixed(7) || null,
          coordsLong: latAndLong.coordsLong.toFixed(7) || null
        });
      }
    } else this.initHasRun = true;  
  }

  ionViewDidLeave() {
    this.isMapLoading ? this.dismissLoading() : null;
    this.isMapLoading = false;
    AppViewData.setLatAndLong({coordsLat: null, coordsLong: null});
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
    const myForm = this.myForm.value;

    this.getCurrentPosition().then((data) => {
      let currentLocation = {coordsLat: data.coordsLat, coordsLong: data.coordsLong};
      console.log("currentLocation: ", currentLocation);
      this.navCtrl.push('MapPage', {currentLocation});
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.GEOLOCATION));
  }

  /* location hours are in format: 09:00am. conver to ISOstring date format */
  populateLocationHours(): void {
    this.isLocationHoursPopulated = true;
    this.setTimesToIsoString(this.selectedLocationToPopulateHours);
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
  
  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.imageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.imageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        img: Utils.generateImgName({appImgIndex: 18, name: this.myForm.controls["name"].value, companyOid: this.auth.companyOid})
      })
    })
    .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.CAMERA));
  }

  dateChange(event) {
    //test
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
  
  submit(myForm, isValid: boolean): void {
    this.isSubmitted = true;

    this.presentLoading(AppViewData.getLoading().saving);
    if (myForm.img) {
      this.uploadImg(myForm).then(() => {
        this.finishSubmit(myForm);
      }).catch(this.errorHandler(this.ERROR_TYPES.IMG_UPLOAD))
    } else this.finishSubmit(myForm);
  }

  finishSubmit(myForm) {
    if (this.isLocationHoursPopulated) {
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
    }
    const toData: ToDataSaveLocation = {toData: myForm, companyOid: this.auth.companyOid};

    this.API.stack(ROUTES.saveLocation, "POST", toData)
        .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
            setTimeout(() => this.navCtrl.pop(), 500);  
          }, this.errorHandler(this.ERROR_TYPES.API));
  }
}
interface ToDataSaveLocation {
    toData: any;
    companyOid: number;
}
