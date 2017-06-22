import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication.service';
import { ReceiptsService } from '../../global/receipts.service';

@IonicPage()
@Component({
  selector: 'page-receipt',
  templateUrl: 'receipt.html'
})
export class ReceiptPage {
  order = null;
  purchaseItem = null;
  auth: AuthUserInfo
  constructor(public navCtrl: NavController, public navParams: NavParams, public authentication: Authentication, public receiptsService: ReceiptsService) {}

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.order = { 
      purchaseItems: [
        { quantity: 1, selectedProduct: {name: "Iced Coffee"}, sizeAndOrPrice: {name: undefined, price: 1.99}, displayPriceWithoutDiscounts: 1.99 },
        { quantity: 2, selectedProduct: {name: "Iced Coffee"}, sizeAndOrPrice: {name: "small", price: 1.99}, displayPriceWithoutDiscounts: 1.99 },
      ], 
      transactionDetails: { 
        rewards: [],
        isRewardUsed: false,
        isRewardAllUsed: false,
        isRewardIndividualUsed: false,
        subtotal: 4.50, 
        taxes: 0.24, 
        total: 4.18, 
        rewardsSavings: 0.50,
        isSocialMediaUsed: false,
        lkpSocialMediaTypeOid: null,
        socialMediaDiscountAmount: 0,
        isEdited: false,
        editAmount: 0.02,
        reasonsForEdit: null,
        oldPrice: null,
        newPrice: null
      } 
    };
    let innerHTML = this.receiptsService.generateReceiptHTML(this.order, this.auth);

    console.log("innerHTML: ", innerHTML);
    //this.auth = this.authentication.getCurrentUser();
    //this.order = this.navParams.data.order;
  }

}
