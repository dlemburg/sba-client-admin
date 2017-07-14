import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { AppUtils } from '../../utils/app-utils';
import { Platform, IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { AuthUserInfo, ILocation, ICompanyDetails } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { CONST_APP_IMGS } from '../../global/global';
import { AppStorage } from '../../global/app-storage';
import { ImageUtility } from '../../global/image-utility';
import { Utils } from '../../utils/utils';


@IonicPage()
@Component({
  selector: 'page-add-location',
  templateUrl: 'add-location.html'
})
export class AddLocationPage extends BaseViewController {
  days: Array<string> = AppUtils.getDays();
  myForm: FormGroup;
  selectedLocation: ILocation;
  isSubmitted: boolean;
  auth: AuthUserInfo;
  closedDaysArr: Array<number> = [];
  initHasRun: boolean = false;
  states: Array<string> = AppUtils.getStates();
  locations: Array<ILocation> = [];
  isCoordsSet: boolean = false;
  imgSrc: string = null;
  img: string = null;
  failedUploadImgAttempts = 0;
  ImageUtility: ImageUtility;

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
      const latAndLong = AppStorage.getLatAndLong();
      if (latAndLong.coordsLat || latAndLong.coordsLong) {
        this.myForm.patchValue({
          coordsLat: latAndLong.coordsLat || null,
          coordsLong: latAndLong.coordsLong || null
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


  /* location hours are in format: 09:00am. conver to ISOstring date format */
  locationChanged(): void {
    let days: any = {
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

      this.setTimesToIsoString(days);
  }

  setTimesToIsoString(days): void {
    let daysOfWeek = AppUtils.getDays();

    // loop through each day open/close
    daysOfWeek.forEach((x, index) => {
      let dayOpenKey = x.toLowerCase() + "Open";
      let dayCloseKey = x.toLowerCase() + "Close";

      if (days[dayOpenKey] === "closed") this.myForm.patchValue({ [dayOpenKey]: "closed", [dayCloseKey]: "closed"});
      else {
        this.myForm.patchValue({
          [dayOpenKey]: DateUtils.convertTimeStringToIsoString(days[dayOpenKey]),
          [dayCloseKey]: DateUtils.convertTimeStringToIsoString(days[dayCloseKey])
        });
      }
    });
  }
  

  closedToggle(event: any, index: number): void {
    let days = AppUtils.getDays();
    let ctrlOpen = days[index].toLowerCase() + "Open";
    let ctrlClose = days[index].toLowerCase() + "Close";

    const filterClosedDaysArr = (): Array<number> => {
      return this.closedDaysArr.filter((x) => {
          return x !== index;
      });
    }

    if (!event.checked) {
      this.closedDaysArr = filterClosedDaysArr();
      this.myForm.patchValue({
        [ctrlOpen]: null,
        [ctrlClose]: null
      });
    } else {
      this.myForm.patchValue({
        [ctrlOpen]: "closed",
        [ctrlClose]: "closed"
      });
      this.closedDaysArr = [...this.closedDaysArr, index];  // concat
    }
  }


  // myForm to uploadImg
  // img: Utils.generateImgName()  *remember to re-do number
  // got rid of data.message in resolve()
  // got rid of different loadings

  getImgCordova() {
    this.presentLoading("Retrieving...");
    this.ImageUtility = new ImageUtility(this.camera, this.transfer, this.file, this.platform);
    this.ImageUtility.getImgCordova().then((data) => {
      this.dismissLoading();
      this.imgSrc = data.imageData;
      this.myForm.patchValue({
        img: Utils.generateImgName({appImgIndex: 18, name: this.myForm.controls["name"].value, companyOid: this.auth.companyOid})
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
  
  submit(myForm, isValid: boolean): void {
    this.isSubmitted = true;
   

    /*** Package for submit ***/
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

    const toData: ToDataSaveLocation = {toData: myForm, companyOid: this.auth.companyOid};

    this.presentLoading(AppViewData.getLoading().saving);

    this.uploadImg(myForm).then(() => {
      this.API.stack(ROUTES.saveLocation, "POST", toData)
        .subscribe(
          (response) => {
            this.dismissLoading(AppViewData.getLoading().saved);
            this.myForm.reset();
            this.img = null;
            this.imgSrc = null;
          }, this.errorHandler(this.ERROR_TYPES.API));
    })
    .catch(this.errorHandler(this.ERROR_TYPES.API))
  }
}
interface ToDataSaveLocation {
    toData: any;
    companyOid: number;
}
