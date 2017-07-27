import { NgModule, ErrorHandler} from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

// plugins
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Camera } from '@ionic-native/camera';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Vibration } from '@ionic-native/vibration';
import { NativeAudio } from '@ionic-native/native-audio';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BackgroundMode } from '@ionic-native/background-mode';
import { GoogleMaps } from '@ionic-native/google-maps';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Printer } from '@ionic-native/printer';
import { Geolocation } from '@ionic-native/geolocation';
import { AppVersion } from '@ionic-native/app-version';


// both admin and owner
import { MyApp } from './app.component';

// services
import { Authentication } from '../global/authentication';    // holds all auth info
import { API } from '../global/api';                          // holds routes and api call
import { SocketIO } from '../global/socket-io';     //  holds socket.io methods
import { NativeNotifications } from '../global/native-notifications';     // all native notification logic

// classes
import { ImageUtility } from '../global/image-utility';
import { BaseViewController } from '../pages/base-view-controller/base-view-controller';


// Components && base-view-controller
import { MyJsonComponent } from '../components/json/json.component';
import { SearchComponent } from '../components/search/search.component';

@NgModule({
  declarations: [
    MyApp,
    BaseViewController,
    MyJsonComponent,
    SearchComponent
],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    ReactiveFormsModule,
    FormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [    // when put here, don't have to be injected
    StatusBar,
    SplashScreen,
    Camera,
    File,
    Transfer,
    Vibration,
    NativeAudio,
    LocalNotifications,
    BackgroundMode,
    GoogleMaps,
    AppVersion,
    Geolocation,
    BarcodeScanner,
    Printer,

    // didn't want to use API, but the way Angular handles app-wide errors vs
    // the way i wanted to handle them caused circular dependencies; so
    // just combined it with the error handler in the API class
   // { provide: ErrorHandler, useClass: API },
    {provide: ErrorHandler, useClass: IonicErrorHandler},

    // my providers
    Authentication,
    API,
    SocketIO,
    NativeNotifications,
  ]
})
export class AppModule {}
