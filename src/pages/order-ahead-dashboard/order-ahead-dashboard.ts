import { Component } from '@angular/core';
import { IonicPage, Events, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { IOrderAhead, AuthUserInfo } from '../../models/models';
import { SocketIO } from '../../global/socket-io';
//import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-order-ahead-dashboard',
  templateUrl: 'order-ahead-dashboard.html'
})
export class OrderAheadDashboardPage extends BaseViewController {
  orders: Array<IOrderAhead> = [];
  setIntervalHandler: any = null;
  loading: any;
  auth: AuthUserInfo = this.authentication.getCurrentUser();
  initHasRun: boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public API: API, 
    public authentication: Authentication, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    public socketIO: SocketIO, 
    public events: Events) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

    /* using ionic's events */
    this.events.subscribe(this.socketIO.socketEvents.incomingNewOrder, (data) => {
      this.onIncomingNewOrder(data);
    });
  }

  ionViewDidLoad() {
    console.log("hello world")
    //debugger;
    /* w/ observer pattern
    this.connection = this.socketService.on(this.socketService.events.incomingNewOrder).subscribe( (data) => {
      this.onIncomingNewOrder(data);
    });
    */
    this.getActiveOrders();
    
  }

  ionViewDidEnter() {
    if (this.initHasRun) {
      this.getActiveOrders();
    } else this.initHasRun = true;

  }

  // fn callback for socket-events listener runs the orders through the same process as ionViewDidLoad
  onIncomingNewOrder(response) {
     let data = response.data;
     let order: Array<IOrderAhead> = this.setArrivalDates([data]);  // the new order
     this.setTimerInterval();    // set arrival times
     this.orders = this.sortOrders([...this.orders, ...order]);  // sort orders by arrival times
  }


  getActiveOrders() {
    if (this.auth.locationOid) {
      let toData = {locationOid: this.auth.locationOid, companyOid: this.auth.companyOid};

      this.presentLoading();
      this.API.stack(ROUTES.getActiveOrders, "POST", toData)
          .subscribe(
              (response) => {
                console.log('response.data: ', response.data);

                this.orders = this.setArrivalDates(response.data.activeOrders);
                this.setTimerInterval(); 
                this.orders = this.sortOrders(response.data.activeOrders);

                this.dismissLoading();
              }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }


  // sorts according to 1.) arrivalMins, then  2.) purchaseDate (if expired)
  sortOrders(orders: Array<IOrderAhead>): Array<IOrderAhead> {
    let unExpiredOrders = orders.filter((x) => {
      return !x.isExpired;
    });
    unExpiredOrders = unExpiredOrders.sort((a, b) => {
      return +a.arrivalMins - +b.arrivalMins;
    });

    let expiredOrders = orders.filter((x) => {
      return x.isExpired;
    }); 

    return [...unExpiredOrders, ...expiredOrders];

  }


  // can be moved to server
  setArrivalDates(orders) {
    orders.forEach((x, index) => {
      let date = new Date(x.purchaseDate);
      x.purchaseDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
      x.arrivalDate = new Date(date.setMinutes(date.getMinutes() + x.eta));
      x.showOrderDetails = false;
    });

    return orders;
  }

  setTimerInterval(): void {
    if (this.setIntervalHandler) clearInterval(this.setIntervalHandler);

    if (this.orders.length) {
      this.runOrderTimers();  // runs on first tick
      this.setIntervalHandler = setInterval(() => {
        this.runOrderTimers();
      }, 1000);
    }
  }

  runOrderTimers(): void {
    this.orders.forEach((x, index) => {
     // debugger;
      if (!x.isExpired) {
        let timeLeft = x.arrivalDate.getTime() - new Date().getTime();

        x.arrivalMins = Math.floor( (timeLeft % (1000 * 60 * 60) / (1000 * 60) ));
        x.arrivalSeconds = Math.floor( (timeLeft % (1000 * 60)) / 1000);

        if (x.arrivalSeconds <= 0 && x.arrivalMins <= 0) x.isExpired = true;
        if (x.arrivalSeconds < 10) x.arrivalSeconds = '0' + x.arrivalSeconds;

        // doesn't need to be async b/c handled on client side as well
        if (x.isExpired) this.setOrderToIsExpired(x);
      }
    });
  }

  onRefreshScreen() {}

  onProcessOrder(order, index): void {
    let toData = { 
      companyOid: this.auth.companyOid,
      transactionOid: order.transactionOid,
      userOid: order.userOid
    };
    this.API.stack(ROUTES.processActiveOrderForOrderAhead, "POST", toData)
        .subscribe(
            (response) => {
              this.orders[index].isProcessing = true;
              console.log('response.data: ' , response.data);
            }, this.errorHandler(this.ERROR_TYPES.API));
  }

  onSetIsActiveFalse(order, index) {
    const toData = {
      transactionOid: order.transactionOid,
      userOid: order.userOid,
      companyOid: this.auth.companyOid
    }
    // set isActive false
    this.API.stack(ROUTES.clearActiveOrderForOrderAhead, "POST", toData)
        .subscribe(
            (response) => {
              //clear order client side
              this.orders = this.orders.filter((x) => {
                return x.transactionOid !== order.transactionOid 
              });
              console.log('response.data: ', response.data);
            }, this.errorHandler(this.ERROR_TYPES.API)); 
  }

  setOrderToIsExpired(order) {
    // API 
    let toData = { 
      companyOid: this.auth.companyOid,
      transactionOid: order.transactionOid,
      userOid: order.userOid
    };
    this.API.stack(ROUTES.setOrderToIsExpired, "POST", toData)
        .subscribe(
            (response) => {
              console.log('response.data: ' , response.data);
            }, this.errorHandler(this.ERROR_TYPES.API));
  }

  ionViewDidLeave() {
    clearInterval(this.setIntervalHandler);
    //this.connection.unsubscribe();
  }
}
