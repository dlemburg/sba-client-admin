import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { BackgroundMode } from '@ionic-native/background-mode';
import { Authentication } from '../global/authentication';
import { SocketIO } from '../global/socket-io';
import { AppViewData } from '../global/app-data';
import { AppFeatures } from '../global/app-features';
import { API, ROUTES } from '../global/api';
import { AppVersion } from '@ionic-native/app-version';
import { AppStartup } from '../global/app-startup';
import { IClientAdminAppStartupInfoResponse, AuthUserInfo } from '../models/models';

declare var cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage;    
  pages: Array<any>;
  auth: AuthUserInfo;
  //companyName = this.authentication.isLoggedIn() ? this.auth.companyName : null;
  appStartup: AppStartup;

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen, 
    public backgroundMode: BackgroundMode, 
    public API: API, 
    private authentication: Authentication, 
    public socketIO: SocketIO,
    public appVersion: AppVersion) {
    
    this.pages = [
      {name: "Home", component: "TabsPage"},
      {name: "Menu", component: "CategoriesPage"},
      {name: "Transactions", component: "TransactionsPage"}
    ];

    /*
      this.appVersion.getVersionNumber().then((versionNumber) => {
        console.log("versionNumber: ", versionNumber);
      });
  */
    this.init();
  }

  init() {
    this.platform.ready().then(() => {
      this.appStartup = new AppStartup(this.API, this.socketIO);

      if (this.authentication.isLoggedIn()) {
        this.auth = this.authentication.getCurrentUser();

        console.log("logged in");

        this.appStartup.getAppStartupInfo(this.auth.companyOid).then((data: IClientAdminAppStartupInfoResponse) => {
          this.appStartup.initializeApp(data, this.auth.companyOid, this.auth.locationOid);
          this.nav.setRoot('TabsPage');
          this.doNativeThingsOnAppStartup(data.currentClientAdminVersionNumber, data.minClientAdminVersionNumber, data.mustUpdateClientAdminApp);
        })
      } else {
        console.log("not logged in");
        this.nav.setRoot('LoginPage');
        this.doNativeThingsOnAppStartup();
      }
    });
  }
/*
  getAppStartupInfo() {
    return new Promise((resolve, reject) => {
      this.API.stack(ROUTES.getClientAdminAppStartupInfo, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
          (response) => {
            const res: IClientAdminAppStartupInfoResponse = response.data.appStartupInfo;
            const defaultImg = res.defaultImg;
            const logoImg = res.logoImg;
            const hasProcessOrder = res.hasProcessOrder;
            const clientAdminVersionNumber = res.currentClientAdminVersionNumber;
            const minClientAdminVersionNumber = res.minClientAdminVersionNumber;
            const mustUpdateClientAdminApp = res.mustUpdateClientAdminApp;

            console.log("response.data: ", response.data);

            resolve({
              defaultImg, 
              logoImg, 
              clientAdminVersionNumber, 
              minClientAdminVersionNumber,
              mustUpdateClientAdminApp,
              hasProcessOrder
            });

          }, (err) => {

            resolve();
            console.log("Problem downloading images on app startup");
          });
    });
  }
  */
  /*

  initializeApp(data: IClientAdminAppStartupInfoResponse) {
    AppViewData.setImgs({
      logoImgSrc: `${ROUTES.downloadImg}?img=${data.logoImg}`,
      defaultImgSrc: data.defaultImg ? `${ROUTES.downloadImg}?img=${data.defaultImg}` : "img/default.png"
    });
    AppFeatures.setFeatures({
      hasProcessOrder: data.hasProcessOrder
    });

    const room = this.auth.companyOid + this.auth.locationOid;
    this.socketIO.connect(room);
    this.nav.setRoot('TabsPage');
    this.doNativeThingsOnAppStartup(data.currentClientAdminVersionNumber, data.minClientAdminVersionNumber, data.mustUpdateClientAdminApp);
  }
  */

  doNativeThingsOnAppStartup(currentClientAdminVersionNumber = 0, minClientAdminVersionNumber = 0, mustUpdateClientAdminVersion = false) {

    // do version checks w/ update prompt here

    this.invokePlatformListeners();
    !this.backgroundMode.isEnabled && this.backgroundMode.enable();
    this.statusBar.styleDefault();
    this.splashScreen.hide();
  }

  invokePlatformListeners() {
    this.platform.pause.subscribe(() => {
      // check token expiry
    });

    this.platform.resume.subscribe(() => {
      if (!this.authentication.isLoggedIn()) {
        this.nav.setRoot("LoginPage");
      }
    });
  }

  navTo(page) {
    this.nav.setRoot(page.component);
  }

  signOut() {
    this.authentication.deleteToken();
    this.socketIO.disconnect();
    this.backgroundMode.isEnabled && this.backgroundMode.disable();

    let navLogin = setTimeout(() => {
      this.nav.setRoot('LoginPage');
    },300);

   // clearTimeout(navLogin);
  }

  ionViewDidUnload() {
  
  }
}



/******************************* NOTES *******************************/

/*


 
  let oneFormProperty = this.myForm.controls.email.value
  let entireForm = this.myForm.value



  // subscribe to form changes 
  subcribeToFormChanges() {
    // initialize stream
    const myFormValueChanges$ = this.myForm.valueChanges;

    // subscribe to the stream 
    myFormValueChanges$.subscribe(x => this.events
        .push({ event: ‘STATUS CHANGED’, object: x }));
}




  // lifecycle events: http://ionicframework.com/docs/v2/api/navigation/NavController/
  

  // runs on every page load
  ionViewDidEnter() {

  }


  // auth guard enter
  ionViewCanEnter() {
     // make sure to add a catch to push if route has auth guard
     this.navCtrl.push(DetailPage)
     .catch(()=> console.log('should I stay or should I go now'))

     if('valid function from Auth here'){
      return true;
    } else {
      return false;
    }
  }

  // auth guard leave
  ionViewCanLeave() {

  }

  //tear down page
  ionViewDidLeave() {

  }

*/


  /*   if/else inside validator
  "zip": ['', c => {
        return mustValidateZip() ? ZipValidator.validate : null
      }],

  */






/* example of initHasRun with lifecylces


 ionViewDidLoad() {
    this.init();
  }

  ionViewDidEnter() {
    this.initHasRun ? this.init() : null;
    this.initHasRun = true;
  }
  

  init() {
    this.API.stack(ROUTES.getLocations + `/${this.auth.companyOid}`, "GET")
      .subscribe(
          (response) => {
            console.log('response: ', response);
            // POPUP
            this.locations = response.data.locations;
          }, (err) => {console.log(err)});
  }


*/



// ARRAY builder
// inside form
//  times: this.formBuilder.array(this.initTimes())

/*   formBuilder.array()   example
  initTimes() {
    let arr = [];
    this.days.forEach((x, index) => {
      arr.push(
        this.formBuilder.group({
          day: [x],
          openTime: ["", Validators.required], 
          closeTime: ["", Validators.required],
          isClosed: [false]
      }));
    });
    return arr;
  }
*/

 /*
    myForm.times.forEach((x) => {
      UtilityService.toIso(x);
    });
  */



/*
    if (ctrl.times.at(index).value.isClosed) {
      ctrl.times.at(index).setValidators([]);
      ctrl.times.at(index).setErrors(null);
    } else 
      ctrl.times.at(index).setValidators([Validators.required]);
*/


// this.myForm.reset();
