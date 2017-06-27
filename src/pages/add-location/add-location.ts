import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { AppUtils } from '../../utils/app-utils';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { AuthUserInfo, ILocation } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';


@IonicPage()
@Component({
  selector: 'page-add-location',
  templateUrl: 'add-location.html'
})
export class AddLocationPage extends BaseViewController {
  days: Array<string> = this.appUtils.getDays();
  myForm: FormGroup;
  selectedLocation: ILocation;
  isSubmitted: boolean;
  auth: AuthUserInfo;
  closedDaysArr: Array<number> = [];
  initHasRun: boolean = false;
  states: Array<string> = this.appUtils.getStates();
  locations: Array<ILocation> = [];
  isCoordsSet: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public validation: Validation, public dateUtils: DateUtils, public appUtils: AppUtils, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.required],
      address: [null, Validators.compose([Validators.required, this.validation.test("isStreetAddress")])],
      city: [null, Validators.required],
      state: ['California', Validators.required],
      zipcode: [null, Validators.compose([Validators.required, this.validation.test('isZipcode')])],
      phoneNumber: [null, Validators.compose([Validators.required, this.validation.test('isPhoneNumber')])],
      coordsLat: [-37.699443],
      coordsLong: [-121.051221],
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
    }, {validator: this.validation.isMismatch('password', 'password2')});
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
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }


  /* location hours are in format: 09:00am. conver to ISOstring date format */
  locationChanged(): void {
    /*
      this.myForm.patchValue({
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
      }); 
    */

    //debugger;

    // input for this.setTimesToIsoString(days);
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
    let daysOfWeek = this.appUtils.getDays();

    // loop through each day open/close
    daysOfWeek.forEach((x, index) => {
      let dayOpenKey = x.toLowerCase() + "Open";
      let dayCloseKey = x.toLowerCase() + "Close";

      if (days[dayOpenKey] === "closed") this.myForm.patchValue({ [dayOpenKey]: "closed", [dayCloseKey]: "closed"});
      else {
        this.myForm.patchValue({
          [dayOpenKey]: this.dateUtils.convertTimeStringToIsoString(days[dayOpenKey]),
          [dayCloseKey]: this.dateUtils.convertTimeStringToIsoString(days[dayCloseKey])
        });
      }
    });
  }

/* google maps */
 getCoords() {
   /* 
   this.myForm.patchValue({
     coordsLat: response.lat,
     coordsLong: response.long
   });

   this.isCoordsSet = true;
   */
 }

  closedToggle(event: any, index: number): void {
    let days = this.appUtils.getDays();
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

  submit(myForm, isValid: boolean): void {
    this.isSubmitted = true;
   
   
    /*** Package for submit ***/
    this.presentLoading(this.appData.getLoading().saving);

    // convert iso string back to time string. this always needs to happen before submitting.
    // 2 ways to create open/close time:   1.) pre-populate, 2.) choose from datepicker.  both need to be converted ISOString -> timeString
      myForm.sundayOpen = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.sundayOpen),
      myForm.sundayClose = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.sundayClose),
      myForm.mondayOpen = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.mondayOpen),
      myForm.mondayClose = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.mondayClose),
      myForm.tuesdayOpen = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.tuesdayOpen),
      myForm.tuesdayClose = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.tuesdayClose),
      myForm.wednesdayOpen = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.wednesdayOpen),
      myForm.wednesdayClose = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.wednesdayClose),
      myForm.thursdayOpen = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.thursdayOpen),
      myForm.thursdayClose = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.thursdayClose),
      myForm.fridayOpen = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.fridayOpen),
      myForm.fridayClose = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.fridayClose),
      myForm.saturdayOpen = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.saturdayOpen),
      myForm.saturdayClose = this.dateUtils.convertIsoStringToHoursAndMinutesString(myForm.saturdayClose)


    const toData: ToDataSaveLocation = {toData: myForm, companyOid: this.auth.companyOid};
    this.API.stack(ROUTES.saveLocation, "POST", toData )
      .subscribe(
          (response) => {
            this.dismissLoading(this.appData.getLoading().saved);
            this.myForm.reset();
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }
}
interface ToDataSaveLocation {
    toData: any;
    companyOid: number;
}
