import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { AppData } from '../../global/app-data';
import { DateUtils } from '../../utils/date-utils';

@IonicPage()
@Component({
  selector: 'page-transactions',
  templateUrl: 'transactions.html'
})
export class TransactionsPage extends BaseViewController {
  transactions: Array<any> = [];
  locations: Array<any> = [];

  /* filters */
  startDate: string;
  endDate: string;
  selectedLocation: any = "*";  // defaults to "*"
  auth: AuthUserInfo;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dateUtils: DateUtils, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.startDate = this.dateUtils.toLocalIsoString(this.dateUtils.getBeginningDateToday().toString());     // set start date to today 12:01a
    this.endDate = this.dateUtils.toLocalIsoString(new Date().toString());       // set end date to today   now

    // doesn't need to be async, bc first query defaults the location to "*"
    this.getLocations();
    this.getTransactions();
  }

  getTransactions(): void {
    const toData: IGetTransactionsFiltersToData = { startDate: this.startDate, endDate: this.endDate, locationOid: this.selectedLocation.toString()}; // converted to string b/c can be '*', so if number, converted back to int on server side
    this.presentLoading();
    
    this.API.stack(ROUTES.getTransactions + `/${this.auth.companyOid}`, "POST", toData)
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.transactions = response.data.transactions;
              this.joinTransactionProductsArray();
              this.dismissLoading();
              
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  getLocations(): void {
    this.API.stack(ROUTES.getLocationsNameAndOid + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
             this.locations = response.data.locations;
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  filterChange(): void {
    this.getTransactions();
  }

  joinTransactionProductsArray() {
    this.transactions.forEach((x) => {
      x.productsArray = x.productsArray.join(', ');
    });
  }

  navTransactionDetails(transaction): void {
    let transactionOid: number = transaction.oid;
    this.navCtrl.push('TransactionsDetailsPage', {transactionOid})
  }
}

export interface IGetTransactionsFiltersToData {
  startDate: string;
  endDate: string;
  locationOid: number|string;
}
