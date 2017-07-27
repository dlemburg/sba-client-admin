import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { ITransactionDetailsOwner, AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';

@IonicPage()
@Component({
  selector: 'page-transactions-details',
  templateUrl: 'transactions-details.html'
})

export class TransactionsDetailsPage extends BaseViewController {
  transactionOid: number;
  doCallGetRewards: boolean = true;
  showOrders: boolean = false;
  showRewards: boolean = false;
  showEdits: boolean = false;
  auth: AuthUserInfo;
  rewards: Array<any> = [];
  order: ITransactionDetailsOwner = {  // need to fix this
    purchaseDate: null,
    location: null,
    order: null,    
    isRewardUsed: null,
    isRewardRejected: null,
    isRewardAllUsed: null,
    isRewardIndividualUsed: null,
    rewards: [],   // just give them brief description here -> can click on it
    products: [],
    price: null,
    subtotal: null,
    total: null,
    taxes: null,
    isEdited: null,
    isEditedReason: null,
    isEditedAmount: null,
    oldPrice: null,
    newPrice: null,
    isSocialMediaDiscount: null
  };
 
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public API: API, 
    public authentication: Authentication, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController) { 
      super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);

      this.auth = this.authentication.getCurrentUser();
  }

  ionViewDidLoad() {
    this.transactionOid = this.navParams.data.transactionOid;

    this.API.stack(ROUTES.getTransactionDetails + `/${this.auth.companyOid}/${this.transactionOid}`, "GET")
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.order = response.data.transactionDetails;
            },  this.errorHandler(this.ERROR_TYPES.API));
  }

  navReward(reward): void {
    let {rewardOid} = reward;
    this.navCtrl.push('RewardsDetailsPage', {rewardOid})
  }

  navProduct(product): void {
    let {productOid} = product;
    this.navCtrl.push('ProductsDetailsPage', {productOid});
  }

  getRewards(): void {
    const route = ROUTES.getRewardsUsedInTransaction + `/${this.auth.companyOid}/${this.transactionOid}
                  ?isRewardAllUsed=${this.order.isRewardAllUsed}
                  &isRewardIndividualUsed=${this.order.isRewardIndividualUsed}`;
    this.showRewards = !this.showRewards;

    if (this.doCallGetRewards) {
      this.doCallGetRewards = false;

      this.API.stack(route, "GET")
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.rewards = response.data.rewards
            }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }
}
