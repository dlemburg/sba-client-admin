import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Validation } from '../../utils/validation-utils';
import { API, ROUTES } from '../../global/api';
import { AppUtils } from '../../utils/app-utils';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { INameAndOid, AuthUserInfo, ILocation } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';

@IonicPage()
@Component({
  selector: 'page-edit-location',
  templateUrl: 'edit-location.html'
})
export class EditLocationPage extends BaseViewController {
  didPasswordChange: boolean = false;
  editValue: any = null;
  editOid: number = null;
  days: Array<string> = this.appUtils.getDays();
  values: Array<INameAndOid> = [];
  myForm: FormGroup;
  selectedLocation: ILocation;
  isSubmitted: boolean;
  auth: AuthUserInfo;
  closedDaysArr: Array<number> = [];
  states: Array<string> = this.appUtils.getStates();
  locations: Array<ILocation> = [];
  isCoordsSet: boolean = false;
  originalValue: string = null;

constructor(public navCtrl: NavController, public navParams: NavParams, public validation: Validation, public dateUtils: DateUtils, public appUtils: AppUtils, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.myForm = this.formBuilder.group({
      name: [null, Validators.required],
      address: [null, Validators.compose([Validators.required, this.validation.test('isStreetAddress')])],
      city: [null, Validators.required],
      state: [null, Validators.required],
      zipcode: [null, Validators.compose([Validators.required, this.validation.test('isZipcode')])],
      phoneNumber: [null, Validators.compose([Validators.required, this.validation.test('isPhoneNumber')])],
      coordsLat: [],
      coordsLong: [],
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
          },  (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
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
        password2: this.editValue.password2
      });

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
      //this.originalValue = this.editValue.name;
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
    let daysOfWeek = this.appUtils.getDays();

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

  closedToggle(event, index): void {
    let days = this.appUtils.getDays();
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
    this.presentLoading(this.appData.getLoading().removing);
    this.API.stack(ROUTES.removeLocation + `/${this.editOid}/${this.auth.companyOid}`, 'POST')
      .subscribe(
        (response) => {
          this.dismissLoading(this.appData.getLoading().removed);
          this.navCtrl.pop();
          console.log('response: ', response); 
        }, (err) => {
          const shouldPopView = true;
          this.errorHandler.call(this, err, shouldPopView)
        });
  }

  submit(myForm, isValid: boolean): void {    


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

      const toData: ToDataEditLocation = {toData: myForm, companyOid: this.auth.companyOid, editOid: this.editValue.oid, didPasswordChange: this.didPasswordChange};
      this.API.stack(ROUTES.editLocation, "POST", toData )
        .subscribe(
            (response) => {
              this.dismissLoading(this.appData.getLoading().saved);
              this.navCtrl.pop();
              console.log('response: ', response);
            },  (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });

  }
}
interface ToDataEditLocation {
    toData: any;
    editOid: number;
    companyOid: number;
    didPasswordChange: boolean;
}
