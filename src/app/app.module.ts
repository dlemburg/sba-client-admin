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

// both admin and owner
import { MyApp } from './app.component';

// services
import { Authentication } from '../global/authentication.service';
import { API } from '../global/api.service';
import { Validation } from '../global/validation';
import { AsyncValidation } from '../global/async-validation.service';
import { UtilityService } from '../global/utility.service';
import { AppDataService } from '../global/app-data.service';
import { ProcessOrderService } from '../pages/process-order/process-order-store.service';
import { SocketService } from '../global/socket.service';
import { ReceiptsService } from '../global/receipts.service';

// Components && base-view-controller
import { BaseViewController } from '../pages/base-view-controller/base-view-controller';
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
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UtilityService,
    Authentication,
    API,
    Validation,
    AsyncValidation,
    AppDataService,
    ProcessOrderService,
    SocketService,
    ReceiptsService
  ]
})
export class AppModule {}
