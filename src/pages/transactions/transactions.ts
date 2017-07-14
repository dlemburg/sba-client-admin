import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { AppViewData } from '../../global/app-data';
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
  startDate: string = DateUtils.toLocalIsoString(DateUtils.getBeginningDateToday().toString());
  endDate: string = DateUtils.toLocalIsoString(new Date().toString());
  selectedLocation: any = "*";  // defaults to "*"
  auth: AuthUserInfo;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController) { 
    super(alertCtrl, toastCtrl, loadingCtrl);

    console.log("startDate: ", this.startDate);
    console.log("end date: ", this.endDate);
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    // doesn't need to be async, bc first query defaults the location to "*"
    this.getLocations();
    this.getTransactions();
  }

  getTransactions(): void {
    const toData: IGetTransactionsFiltersToData = { startDate: this.startDate, endDate: this.endDate, locationOid: this.selectedLocation.toString(), companyOid: this.auth.companyOid}; // converted to string b/c can be '*', so if number, converted back to int on server side
    this.presentLoading();
    
    this.API.stack(ROUTES.getTransactions, "POST", toData)
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.transactions = response.data.transactions;
              this.joinTransactionProductsArray();
              this.dismissLoading();
              
            },this.errorHandler(this.ERROR_TYPES.API));
  }

  getLocations(): void {
    this.API.stack(ROUTES.getLocationsNameAndOid + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
             this.locations = response.data.locations;
            }, this.errorHandler(this.ERROR_TYPES.API));
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
  companyOid: number;
}
