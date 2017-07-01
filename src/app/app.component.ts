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

declare var cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage;    
  pages: Array<any>;
  auth;

  constructor(
    platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen, 
    public backgroundMode: BackgroundMode, 
    public API: API, 
    private authentication: Authentication, 
    public socketIO: SocketIO) {
      
    platform.ready().then(() => {

      if (this.authentication.isLoggedIn()) {
        this.initializeApp();
      } else {
        this.nav.setRoot('LoginPage');
      }
    });
  }

  /*
    set appData
    set appFeatures
    connect to socket
    navigate to TabsPage
    enable background mode

   */

  initializeApp() {
    this.auth = this.authentication.getCurrentUser();

    this.API.stack(ROUTES.getAppStartupInfo, "POST", {companyOid: this.auth.companyOid})
      .subscribe(
        (response) => {
          const defaultImg = response.data.imgs.defaultImg;

          console.log("response.data: ", response.data);
          
          AppViewData.setImgs({
            logoImgSrc: `${ROUTES.downloadImg}?img=${response.data.imgs.logoImg}`,
            defaultImgSrc: defaultImg ? `${ROUTES.downloadImg}?img=${defaultImg}` : "img/default.png"
          });
          AppFeatures.setFeatures({
            hasProcessOrder: response.data.appFeatures.hasProcessOrder
          });

          this.finishInitialization();

        }, (err) => {

          this.finishInitialization();
          console.log("Problem downloading images on app startup");
        });
  }

  finishInitialization() {

    const room = this.auth.companyOid + this.auth.locationOid;
    this.socketIO.connect(room);
    this.nav.setRoot('TabsPage');


    !this.backgroundMode.isEnabled && this.backgroundMode.enable();
    this.statusBar.styleDefault();
    this.splashScreen.hide();
  }
  

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  signOut() {

    this.authentication.deleteToken();
    this.socketIO.disconnect();
    this.backgroundMode.isEnabled && this.backgroundMode.disable();


    // clean up providers that hold state here

    //AppViewData.cleanup();
    //AppFeatures.cleanup();

    let navLogin = setTimeout(() => {
      this.nav.setRoot('LoginPage');
    },300);

   // clearTimeout(navLogin);
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
