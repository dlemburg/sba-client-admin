import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Authentication } from '../global/authentication.service';
import { SocketService } from '../global/socket.service';
import { AppDataService } from '../global/app-data.service';

declare var cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage;    
  pages: Array<any>;
  auth;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private authentication: Authentication, public socketService: SocketService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();


      //cordova.file.cacheDirectory ??
      if (platform.is('ios')) {
        AppDataService.setStorageDirectory(cordova.file.documentsDirectory);
      }
      else if(platform.is('android')) {
         AppDataService.setStorageDirectory(cordova.file.dataDirectory);
      }
    });

    this.pages = [
      {title: 'Home', component: 'TabsPage' },
      {title: 'Menu', component: 'CategoriesPage'},
      {title: 'Rewards', component: 'RewardsPage'},
      {title: 'Transactions', component: 'TransactionsPage'}
    ];
    this.auth = this.authentication.getCurrentUser();

    if (this.authentication.isLoggedIn()) {
      const room = this.auth.companyOid + this.auth.locationOid;
      this.socketService.connect(room);
      this.rootPage = 'TabsPage' // AppImagesPage 
    } else {
      this.rootPage = 'LoginPage'; // LoginPage;
    }
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  signOut() {
    // clean up services here

    this.authentication.deleteToken();
    this.socketService.disconnect();

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
