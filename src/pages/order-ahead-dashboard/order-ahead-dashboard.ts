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
    this.events.subscribe(this.socketIO.socketEvents.incomingNewOrder, (response) => {
      const data = response.data;
      //this.onIncomingNewOrder(data); // the right way, but would have to repackage some of data
      this.getActiveOrders("New order incoming...", true, data)    // the fast way: on new order -> get all orders
    });
  }

  /* EVENTS THAT CAN HAPPEN ON THIS PAGE
  - incoming order (socket -> ionic event)
  - process
  - clear active
  - customer never picked up

  */

  ionViewDidLoad() {
    
    /* w/ observer pattern
    this.connection = this.socketService.on(this.socketService.events.incomingNewOrder).subscribe( (data) => {
      this.onIncomingNewOrder(data);
    });
    */
    this.getActiveOrders(); 
  }

  ionViewDidLeave() {
    clearInterval(this.setIntervalHandler);
    //this.connection.unsubscribe();
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
     this.orders = this.setTimerIntervalForEachOrder([...this.orders, ...order]);    // set arrival times
     this.orders = this.sortOrders(this.orders);  // sort orders by arrival times
  }


  getActiveOrders(message: string = "Loading...", isIncomingNewOrder: boolean = false, data = null) {
    if (this.auth.locationOid) {
      let toData = {locationOid: this.auth.locationOid, companyOid: this.auth.companyOid};

      this.presentLoading(message);
      this.API.stack(ROUTES.getActiveOrders, "POST", toData)
        .subscribe(
          (response) => {
            console.log('response.data: ', response.data);

            this.orders = this.setArrivalDates(response.data.orders);
            this.setTimerIntervalForEachOrder(this.orders); 
            this.orders = this.sortOrders(response.data.orders);

            if (isIncomingNewOrder && data.purchaseDate) {
              this.presentToast(false, `You've just received a new order! The eta for this order is: ${data.eta} minutes`, "top", 8000, "toast-primary");

              //let order = this.orders.find((x) => x.purchaseDate === data.purchaseDate);
              //order ? order.isIncomingNewOrder = true : null;

              this.orders.forEach((x) => {
                x.purchaseDate === data.purchaseDate.slice(0, -4) ? x.isIncomingNewOrder = true : x.isIncomingNewOrder = false;
              })
            }

            this.dismissLoading();
          }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }

  onRefreshScreen() {}


  // sorts according to 1.) arrivalMins, then  2.) purchaseDate (if expired)
  sortOrders(orders: Array<IOrderAhead>): Array<IOrderAhead> {
    let unexpiredOrders = orders.filter((x) => {
      return !x.isExpired;
    });
    unexpiredOrders = unexpiredOrders.sort((a, b) => {
      return +a.arrivalMins - +b.arrivalMins;
    });

    let expiredOrders = orders.filter((x) => {
      return x.isExpired;
    }); 

    return [...unexpiredOrders, ...expiredOrders];

  }

  setArrivalDates(orders: Array<IOrderAhead>): Array<IOrderAhead> {
    orders.forEach((x, index) => {
      let date = new Date(x.purchaseDate);
      x.displayPurchaseDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
      x.arrivalDate = new Date(date.setMinutes(date.getMinutes() + x.eta));
      x.showOrderDetails = false;
    });
    return orders;
  }


  setTimerIntervalForEachOrder(orders: Array<IOrderAhead>): Array<IOrderAhead> {
    if (this.setIntervalHandler) clearInterval(this.setIntervalHandler);

    if (orders.length) {
      this.runOrderTimers(orders);  // runs on first tick
      this.setIntervalHandler = setInterval(() => this.runOrderTimers(orders), 1000);
    }
    return orders;
  }

  runOrderTimers(orders): void {
    orders.forEach((x, index) => {
     
      if (!x.isExpired) {
        let timeLeft = x.arrivalDate.getTime() - new Date().getTime();

        x.arrivalMins = Math.floor( (timeLeft % (1000 * 60 * 60) / (1000 * 60) ));
        x.arrivalSeconds = Math.floor( (timeLeft % (1000 * 60)) / 1000);

        if (x.arrivalSeconds <= 0 && x.arrivalMins <= 0) x.isExpired = true;
        if (x.arrivalSeconds < 10) x.arrivalSeconds = '0' + x.arrivalSeconds;

        // doesn't need to be async b/c handled on client side as well
        if (x.isExpired) {
          this.setOrderExpired(x);
          this.orders = this.sortOrders(this.orders);
        }
      }
    });
  }

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

  onSetInactive(order, index) {
    const toData = {
      transactionOid: order.transactionOid,
      userOid: order.userOid,
      companyOid: this.auth.companyOid,
      customerNeverPickedUp: order.customerNeverPickedUp
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

  setOrderExpired(order) {
    if (!order.isExpired) {
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
  }

  customerNeverPickedUp(order, index) {
    order.customerNeverPickedUp = true;
  }

  
}
