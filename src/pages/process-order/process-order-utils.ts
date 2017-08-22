import { Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Slides, LoadingController, ModalController } from 'ionic-angular';
import { IErrChecks, IOrder, ICompanyDetails, IPurchaseItem } from '../../models/models';
import { Utils } from '../../utils/utils';

@Injectable()
export class ProcessOrderUtils {

constructor() { }
  
  //  x.displayPriceWithoutDiscounts = (x.sizeAndOrPrice.price * x.quantity) + (x.addonsCost * x.quantity) + (x.dairyCost);

  addToOrder(order: IOrder, purchaseItem: IPurchaseItem, productDetails, companyDetails): IOrder {
    purchaseItem.addonsCost = this.calculateAddonsCost(purchaseItem, productDetails, companyDetails);
    purchaseItem.dairyCost = this.calculateDairyCost(purchaseItem);
    order.purchaseItems = [...order.purchaseItems, purchaseItem];
    order.transactionDetails.subtotal = this.calculateSubtotal(order, companyDetails);

    return order;
  }

  calculateSubtotal(order: IOrder, COMPANY_DETAILS: ICompanyDetails): number {
    let subtotal = 0;
    order.purchaseItems.forEach((x, index) => {
      subtotal += (x.sizeAndOrPrice.price * x.quantity) + (x.addonsCost * x.quantity) + (x.dairyCost);
    });
    return Utils.round(subtotal);
  }

  calculateTaxes(subtotal: number, TAX_RATE: number): number {
    return Utils.round(subtotal * TAX_RATE);
  }

  calculateTotal(subtotal: number, taxes: number): number {
    return Utils.round(subtotal + taxes);
  }

  calculateAddonsCost(purchaseItem: IPurchaseItem, productDetails, companyDetails): number {
    if (purchaseItem.addons && purchaseItem.addons.length) {
      if (companyDetails.doesChargeForAddons && productDetails.numberOfFreeAddonsUntilCharged !== null) {
        if (purchaseItem.addons.length > productDetails.numberOfFreeAddonsUntilCharged) {
            let numberOfChargedAddons = purchaseItem.addons.length - productDetails.numberOfFreeAddonsUntilCharged;
            return Utils.round(numberOfChargedAddons * productDetails.addonsPriceAboveLimit);
        }
      }
    }
    return 0;
  }

  calculateDairyCost(purchaseItem): number {
    let dairyCost = 0;
    if (purchaseItem.dairy && purchaseItem.dairy.length) purchaseItem.dairy.forEach((x) => dairyCost += x.price || 0);
    return dairyCost;
  }

  calculateFreePurchaseItem(order: IOrder, individualRewards): number {
    let highItem: IPurchaseItem; 

    if (individualRewards.length) {
      order.purchaseItems.forEach((x, i) => {
        if (x.sizeAndOrPrice.price > highItem.sizeAndOrPrice.price) {
            highItem = Object.assign({}, x);
            highItem.sizeAndOrPrice.price = x.sizeAndOrPrice.price;
        }
      });
      if (highItem.discounts > 0) highItem.sizeAndOrPrice.price -= highItem.discounts;
    
      return highItem.sizeAndOrPrice.price;
    } else return 0;
  }

  calculateEditAmount(subtotal: number, editAmount: number) {
    return Utils.round(subtotal - editAmount);
  }

  clearProductDetails() {
    return {
        sizesAndPrices: [],
        addonsToClient: [],
        flavorsToClient: [],
        dairyToClient: [],
        sweetenerToClient: [],
        varietyToClient: [],
        fixedPrice: null,
        oid: null,
        numberOfFreeAddonsUntilCharged: null,
        addonsPriceAboveLimit: null
    };
  }

  clearPurchaseItem() {
    return {
      addons: [],
      flavors: [],
      dairy: [],
      variety: [],
      sweetener: [],
      selectedProduct: { name: null, oid: null, imgSrc: null},
      sizeAndOrPrice: { name: null, oid: null, price: null},
      addonsCost: 0,
      dairyCost: 0,
      quantity: 1,
      discounts: 0
    }; 
  }

   clearTransactionDetails(subtotal, transactionDetails) {
     return {
      subtotal: subtotal, 
      rewards: [],
      isRewardUsed: false,
      isRewardAllUsed: false,
      isRewardIndividualUsed: false,
      taxes: null, 
      total: null, 
      rewardsSavings: 0,
      isSocialMediaUsed: false,
      socialMediaType: null,
     // socialMediaPointsBonus: 0,
      isEdited: false,
      editAmount: 0,
      reasonsForEdit: null,
      oldPrice: null,
      newPrice: null
     }
   }

   doChecksPurchaseItem(purchaseItem, productDetails): IErrChecks {
    let errs = [];

    if (!purchaseItem.selectedProduct.name) {
      errs.push('You forgot to select a product!');
      return {isValid: false, errs: errs};
    }
    if (!purchaseItem.sizeAndOrPrice.name && productDetails.sizesAndPrices.length) {
      errs.push('You forgot to select a size!');
      return {isValid: false, errs: errs};
    }
    return {isValid: true, errs};
  }

  transactionIsValid(balance, total, acceptsPartialPayments) {
   // return ((balance > total) || acceptsPartialPayments) ? true : false;
    return ((balance > total)) ? true : false;
  }


}