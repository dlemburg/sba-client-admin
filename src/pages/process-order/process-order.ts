import { Component, ViewChild } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { Utils } from '../../utils/utils';
import { IBarcodeUserData, IBarcodeRewardData, ICompanyDetails, IOrder, IPurchaseItem, INameAndOid, IProductForProcessOrder, AuthUserInfo, IEditTotalDismissProps, IUserDataForProcessOrder,IGetEligibleRewardsToData,IProcessOrderToData,IOrderConfirmation } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Slides, LoadingController, ModalController } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { ReceiptTemplates } from '../../global/receipt-templates';
import { CONST_ID_TYPES, CONST_RECEIPT_TYPES, CONST_REWARDS_TYPES, CONST_REWARDS_DISCOUNT_RULE, CONST_REWARDS_DISCOUNT_TYPE, CONST_REWARDS_PROCESSING_TYPE } from '../../global/global';
import { NativeNotifications } from '../../global/native-notifications';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { ProcessOrderUtils } from './process-order-utils';
import { ProcessOrderService } from './process-order.service';

@IonicPage()
@Component({
  selector: 'page-process-order',
  templateUrl: 'process-order.html',
  providers: [ProcessOrderUtils]
})

export class ProcessOrderPage extends BaseViewController {
  @ViewChild(Slides) slides: Slides;
  canViewProducts: boolean = false;
  initHasRun: boolean = false;
  rewards: Array<any> = [];
  isFreePurchaseItemSelected: boolean = false;
  orderHasBeenEdited: boolean = false;
  showEditBtn: boolean = false;
  dataFromRewardIndividualBarcodeScan: any = null;
  isUserBarcodeScanned: boolean = false;
  currentSlideIndex: number = 0;
  selectedCategory: any;
  coupons: Array<any> = [];
  products: Array<INameAndOid> = [];
  categories: Array<INameAndOid> = [];
  employeeComment: string = null;
  dairyQuantities = Utils.getNumbersList(5);
  userData: IUserDataForProcessOrder = {
    userOid: null,
    email: null,
    companyOid: null,
    socialMediaType: null,
    isSocialMediaUsed: false,
    balance: 0
  };
  mobileCardId: number = null;
  sufficientFunds: boolean = true;
  barcodeUserData: IBarcodeUserData;
  barcodeRewardData: IBarcodeRewardData;
  companyDetails: ICompanyDetails = {};
  ID_TYPES = CONST_ID_TYPES;
  REWARDS_TYPE = CONST_REWARDS_TYPES;
  REWARDS_PROCESSING_TYPE = CONST_REWARDS_PROCESSING_TYPE;
  REWARDS_DISCOUNT_RULE = CONST_REWARDS_DISCOUNT_RULE;
  REWARDS_DISCOUNT_TYPE = CONST_REWARDS_DISCOUNT_TYPE;
  RECEIPT_TYPES = CONST_RECEIPT_TYPES;
  
  order: IOrder = { 
    purchaseItems: [], 
    transactionDetails: { 
      rewards: [],
      isRewardUsed: false,
      isRewardAllUsed: false,
      isRewardIndividualUsed: false,
      subtotal: null, 
      taxes: null, 
      total: null, 
      rewardsSavings: 0,
      isSocialMediaUsed: false,
      socialMediaType: null,
     // socialMediaPointsBonus: 0,
      isEdited: false,
      editAmount: 0,
      reasonsForEdit: [],
      oldPrice: null,
      newPrice: null
    } 
  };
  purchaseItem: IPurchaseItem = {
    selectedProduct: {oid: null, name: null, imgSrc: null},
    sizeAndOrPrice: { oid: null, name: null, price: null},
    quantity: 1,
    addons: [],
    flavors: [],
    dairy: [],
    variety: [],
    sweetener: [],
    addonsCost: 0,
    dairyCost: 0,
    discounts: 0,
    displayPriceWithoutDiscounts: 0
  };
  productDetails: IProductForProcessOrder = {
    sizesAndPrices: [],
    addonsToClient: [],
    flavorsToClient: [],
    dairyToClient: [],
    varietyToClient: [],
    sweetenerToClient: [],
    fixedPrice: null,
    oid: null,
    numberOfFreeAddonsUntilCharged: null,
    addonsPriceAboveLimit: null
  };
  quantities: Array<number> = Utils.getNumbersList();
  isEditInProgress: {status: boolean, index: number} = { status: false, index: null}
  showRewardDescription: boolean = false;
  showRewards: boolean = false;
  showOrder: boolean = false;
  auth: AuthUserInfo = this.authentication.getCurrentUser();
  currentCategory: {oid: number, name: string, imgSrc: string} = {oid: null, name: null, imgSrc: ""};
  currentProduct: { oid: number, name?: string, imgSrc: string } = { oid: null, name: null, imgSrc: ""};
  totalBeforeEdits: number = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public barcodeScanner: BarcodeScanner,
    public printer: Printer,
    public nativeNotifications: NativeNotifications, 
    public API: API,
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController,
    public processOrderUtils: ProcessOrderUtils,
    public processOrderService: ProcessOrderService) {
      super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
  }

  ionViewDidLoad() { this.getCompanyDetails(); }
  ionViewDidEnter() { this.initHasRun ? this.getCompanyDetails() : this.initHasRun = true; }

  compareFn(c1, c2): boolean { return c1 && c2 ? c1.oid === c2.oid : c1 === c2;}   // [compareWith]="compareFn"

  slideChanged() {
    if (this.order.purchaseItems.length && this.slides.getActiveIndex() === 0) {
      
      this.order.purchaseItems = this.order.purchaseItems.map((x, index) => {
        x.discounts = 0;
        x.isFreePurchaseItem = false;
        return x;
      });
      
      console.log("slide changed... this.order: ", this.order);
      this.order.transactionDetails = this.processOrderUtils.clearTransactionDetails(this.processOrderUtils.calculateSubtotal(this.order, this.companyDetails), this.order.transactionDetails);
    } else this.getEligibleRewards();
  }

  btnSlideChange() {     
    this.slides.slideNext();
  }

  getCompanyDetails() {
    this.presentLoading();
    this.API.stack(ROUTES.getCompanyDetailsForTransaction, "POST", {companyOid: this.auth.companyOid})
      .subscribe( (response) => {
        this.companyDetails = response.data.companyDetails;
        this.getCategories();
      }, this.errorHandler(this.ERROR_TYPES.API));
  }

  getCategories() {
    this.products = []; // reset products
    const cachedCategories = this.processOrderService.getCategories();

    if (cachedCategories.length) {
      this.categories = cachedCategories;
    } else {
      this.API.stack(ROUTES.getCategories + `/${this.auth.companyOid}`, "GET")
        .subscribe( (response) => {
          this.dismissLoading();
          this.categories = this.processOrderService.setCategories(response.data.categories);
        }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }

  getProducts(currentCategory): void {
    this.productDetails = this.processOrderUtils.clearProductDetails();
    this.purchaseItem = this.processOrderUtils.clearPurchaseItem();

    const cachedProducts = this.processOrderService.getProducts(currentCategory.oid);
    if (cachedProducts.length) {
      this.products = cachedProducts;
      this.canViewProducts = true;
    } else {
      this.API.stack(ROUTES.getAllProducts + `/${this.auth.companyOid}`, "GET")
        .subscribe( (response) => {
          this.products = this.processOrderService.setProducts(response.data.products).filter((x) => currentCategory.oid === x.categoryOid);
          this.canViewProducts = true;

        }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }

  getProductInfo(productOid) {
    const cachedProductDetails = this.processOrderService.getCachedProductDetails(productOid);
    if (cachedProductDetails) {
      this.productDetails = cachedProductDetails;

      if (!this.productDetails.sizesAndPrices.length && this.productDetails.fixedPrice) {
        this.purchaseItem.sizeAndOrPrice = {name: null, oid: null, price: this.productDetails.fixedPrice};
      }
    } else {
        this.API.stack(ROUTES.getProductDetails + `/${this.auth.companyOid}/${productOid}`, "GET")
          .subscribe( (response) => {
            this.productDetails = this.processOrderService.setCachedProductDetails(productOid, response.data.productDetails);

            if (!this.productDetails.sizesAndPrices.length && this.productDetails.fixedPrice) {
              this.purchaseItem.sizeAndOrPrice = {name: null, oid: null, price: this.productDetails.fixedPrice};
            }
          }, this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false}));
    }
  }

  getUserData(userOidOrMobileCardId, idType, socialMediaOpts = {socialMediaType: null, isSocialMediaUsed: false}) {
    this.presentLoading();
    console.log("about to get user data after scanning barcode");
    let toData = { userOidOrMobileCardId, companyOid: this.auth.companyOid, idType};
    this.API.stack(ROUTES.getUserDataForProcessOrder, "POST", toData)
      .subscribe( (response) => {

        console.log("user response.data: ", response.data);
        this.dismissLoading();
        this.userData = response.data.userData ? response.data.userData : {balance: null, userOid: null};

        if (this.userData.userOid === null) this.presentToast(false, `No user found by this id number.`)
        else if (this.processOrderUtils.transactionIsValid(this.userData.balance, this.order.transactionDetails.total, this.companyDetails.acceptsPartialPayments)) {
          
          /* TODO later: popup to confirm balance not enough, apply remaining balance, alert total due */
          this.sufficientFunds = true;
          this.presentToast(false, `Captured user info! Complete transaction at any time.`);
          if (socialMediaOpts.isSocialMediaUsed) {
              this.order.transactionDetails.isSocialMediaUsed = true;
              this.order.transactionDetails.socialMediaType = socialMediaOpts.socialMediaType;
          } 
        } 
        else {
          this.mobileCardId = null;
          this.sufficientFunds = false;
          this.showPopup({
            title: 'Uh oh!', 
            message: "The customer has insufficient funds. Customer balance:  $" + this.userData.balance, 
            buttons: [{text: "OK"}]
          });
          this.userData = {balance: null, userOid: null};

        }
      }, (err) => {
        console.log("err: ", err);
        this.errorHandler(this.ERROR_TYPES.API)(err);
      });
  }

  setDefaultDairy() {
    this.purchaseItem.dairy.forEach((x) => {
      x.quantity = x.hasQuantity && (!x.quantity && x.quantity !== 0) ? 3 : x.quantity;
    })
  }
  
  ////////////////////////////////////////////////   modals //////////////////////////////////////////////////
  presentReasonsForEditModal() {
    if (this.order.transactionDetails.reasonsForEdit && this.order.transactionDetails.reasonsForEdit.length) {
      let modal = this.modalCtrl.create('ReasonsForEditPage', {reasons: this.order.transactionDetails.reasonsForEdit}, {enableBackdropDismiss: true, showBackdrop: true});
      modal.present();
    }
  }

  presentProductsModal() {
    let selectProductModal = this.modalCtrl.create('ProcessOrderProductsPage', { products: this.products });
    selectProductModal.onDidDismiss((data) => {
      if (data) {
        this.currentProduct = { oid: data.oid, imgSrc: AppViewData.getDisplayImgSrc(data.img)};
        this.purchaseItem.selectedProduct = {oid: data.oid, name: data.name, imgSrc: this.currentProduct.imgSrc };
        this.getProductInfo(data.oid);
      }
    });
    selectProductModal.present();
  }

  presentCategoriesModal() {
    this.canViewProducts = false;

    let selectCategoryModal = this.modalCtrl.create('ProcessOrderCategoriesPage', { categories: this.categories });
    selectCategoryModal.onDidDismiss((data) => {
      if (data) {
        this.currentCategory = { oid: data.oid, name: data.name, imgSrc: AppViewData.getDisplayImgSrc(data.img)};
        this.getProducts(this.currentCategory);
      }
    });
    selectCategoryModal.present();
  }

  presentEditTotalModal() {
    this.orderHasBeenEdited = true;

    let editTotalModal = this.modalCtrl.create('EditTotalPage', { 
      total: this.order.transactionDetails.total, 
      rewardsSavings: this.order.transactionDetails.rewardsSavings, 
      isProcessOrder: true  }, 
      {enableBackdropDismiss: false}
    );

    editTotalModal.onDidDismiss((data: IEditTotalDismissProps) => {
      if (data.isEdited) {
        let reasonsForEdit = this.order.transactionDetails.reasonsForEdit ? this.order.transactionDetails.reasonsForEdit : [];
        //let editAmount = this.order.transactionDetails.editAmount + (this.processOrderUtils.calculateEditAmount(data.subtotal, data.cacheTotal));
        let editAmount = Math.abs(this.totalBeforeEdits - data.total);

        this.order.transactionDetails = Object.assign({}, this.order.transactionDetails, {
          isEdited: true, 
          editAmount,
          reasonsForEdit: [...reasonsForEdit, 
            {
              reason: data.reasonForEdit, 
              amount: this.processOrderUtils.calculateEditAmount(data.total, data.cacheTotal),
              priceDown: data.total < data.cacheTotal ? true : false
          }],
          discount: 0,
          //rewards: [],
          total: data.total,
          taxes: this.processOrderUtils.calculateTaxes(data.total, this.companyDetails.taxRate),
         // total:  this.processOrderUtils.calculateTotal(data.total, this.order.transactionDetails.taxes)
        });
      }
    });
    editTotalModal.present();
  }

  presentCommentModal() {
    let commentModal = this.modalCtrl.create('CommentPage', {comment: this.employeeComment}, {showBackdrop: true, enableBackdropDismiss: false});
    commentModal.onDidDismiss((data) => {
      this.employeeComment = data && data.comment ? data.comment : null;
    });
    commentModal.present();
  }

  onEditPurchaseItem(purchaseItem, index) {
    this.userData = { userOid: null, balance: null, companyOid: null};
    this.mobileCardId = null;

    this.isEditInProgress = this.setEditInProgress(index);
    this.getProductInfo(purchaseItem.selectedProduct.oid);
    this.purchaseItem = purchaseItem;
  }

  finishEditPurchaseItem() {
    const index = this.isEditInProgress.index;

    // edits
    this.order.purchaseItems[index] = this.purchaseItem;
    this.isEditInProgress = this.clearEditInProgress();

    // global
    this.purchaseItem = this.processOrderUtils.clearPurchaseItem();
    this.productDetails = this.processOrderUtils.clearProductDetails();

  }

  setEditInProgress(index) { return { status: true, index: index };}
  clearEditInProgress() { return {status: false, index: null};}
  selectDairyQuantity(purchaseItemIndex, quantity) { this.purchaseItem.dairy[purchaseItemIndex].quantity = quantity;}

  addToOrder(purchaseItem): void {
    let checks = this.processOrderUtils.doChecksPurchaseItem(purchaseItem, this.productDetails);
    
    if (!checks.isValid) this.presentToast(false, checks.errs.join(". "));
    else {
      this.presentToast(false, "Added item!");
      this.order = this.processOrderUtils.addToOrder(this.order, purchaseItem, this.productDetails, this.companyDetails);
      this.purchaseItem = this.processOrderUtils.clearPurchaseItem();
      this.productDetails = this.processOrderUtils.clearProductDetails();

      console.log("added to order... this.order: ", this.order);
    }
  }

  removePurchaseItemFromOrder(order, purchaseItem, index) {
    const confirmFn = () => {
      this.order = Object.assign({}, order, {
        purchaseItems: order.purchaseItems.filter((x, i) => i !== index),
        subtotal: this.processOrderUtils.calculateSubtotal(this.order, this.companyDetails)
      });
      this.purchaseItem = this.processOrderUtils.clearPurchaseItem();
      this.productDetails = this.processOrderUtils.clearProductDetails();
      this.isEditInProgress = this.clearEditInProgress();
    }
    const cancelFn = () => { this.isEditInProgress = this.clearEditInProgress(); }

    this.showPopup({
      title: "Please confirm",
      message: "Are you sure you want to remove this item?",
      buttons: [{text: AppViewData.getPopup().defaultCancelButtonText, handler: cancelFn}, {text: AppViewData.getPopup().defaultConfirmButtonText, handler: confirmFn}]
    });
  }

  getIndividualRewards(rewards): Array<any> {
    return rewards.length ? rewards.filter((x) => x.type && x.type === this.REWARDS_TYPE.REWARDS_INDIVIDUAL) : [];
  }

  getEligibleRewards() { 
    if (this.order.purchaseItems.length) {
      this.presentLoading();

      const dateInfo = DateUtils.getCurrentDateInfo();
      const toData: IGetEligibleRewardsToData = {
        date: DateUtils.toLocalIsoString(dateInfo.date.toString()),
        day: dateInfo.day, 
        hours: dateInfo.hours,
        mins: dateInfo.mins, 
        purchaseItems: this.order.purchaseItems,
        companyOid: this.auth.companyOid,
        taxRate: this.companyDetails.taxRate,
      };

      this.API.stack(ROUTES.getEligibleRewardsProcessingTypeAutomaticForTransaction, "POST", toData)
        .subscribe( (response) => {
          console.log("response.data = ", response.data);
          this.order.purchaseItems = response.data.purchaseItems;
          this.order.transactionDetails = Object.assign({}, response.data.transactionDetails);
          this.totalBeforeEdits = this.order.transactionDetails.total;

          this.dismissLoading();
        }, this.errorHandler(this.ERROR_TYPES.API));
    }
  }

  onScanIndividualRewardBarcode() {
    this.barcodeScanner.scan({resultDisplayDuration: 0}).then((barcodeData) => {
      // barcode data will only have rewardOid, isFreePurchaseItem, userOid... i.e.: 139$1$28
      if (!barcodeData.cancelled) {
        if (barcodeData.text.indexOf("$") > -1) {
          let barcodeRewardData: Array<string> = barcodeData.text.split("$");
          
          this.barcodeRewardData = {
            rewardOid: +barcodeRewardData[0],
            isFreePurchaseItem: +barcodeRewardData[1] === 0 ? false : true,
            userOid: +barcodeRewardData[2]
          }
          if (this.barcodeRewardData.isFreePurchaseItem) {
            const freePurchaseItemPrice = this.processOrderUtils.calculateFreePurchaseItem(this.order, this.getIndividualRewards(this.order.transactionDetails.rewards));
            
            this.order.transactionDetails = Object.assign({}, this.order.transactionDetails, {
              rewards: [...this.order.transactionDetails.rewards, ...this.getIndividualRewards(this.order.transactionDetails.rewards)],
              rewardsSavings: Utils.round(this.order.transactionDetails.rewardsSavings + freePurchaseItemPrice),
              subtotal: Utils.round(this.order.transactionDetails.subtotal),
              taxes: this.processOrderUtils.calculateTaxes((this.order.transactionDetails.subtotal - this.order.transactionDetails.rewardsSavings), this.companyDetails.taxRate),
              total: Utils.round(this.order.transactionDetails.total - this.order.transactionDetails.rewardsSavings)
            });
          }
        }
      } 
    }, this.errorHandler(this.ERROR_TYPES.PLUGIN.BARCODE));
  }

  onScanUserBarcode() {
    this.barcodeScanner.scan({resultDisplayDuration: 0}).then((barcodeData) => {
      if (!barcodeData.cancelled && barcodeData.text.indexOf("$") > -1) {
        const barcodeUserDataArr: Array<string> = barcodeData.text.split("$");
        
        const barcodeUserData = {
          userOid: +barcodeUserDataArr[0],
          companyOid: +barcodeUserDataArr[1],
          isSocialMediaUsed: +barcodeUserDataArr[2] === 0 ? false : true,
          socialMediaType: +barcodeUserDataArr[3]
        }
        console.log("barcodeUserData: ", barcodeUserData);


        if (barcodeUserData.companyOid === +this.auth.companyOid) {
          if (barcodeUserData.isSocialMediaUsed) {
            this.presentAcceptOrRejectSocialMediaAlert(barcodeUserData).then((data) => {
              if (!data.isAccepted) {
                barcodeUserData.socialMediaType = null;
                barcodeUserData.isSocialMediaUsed = false;
              }
              this.finishOnScanUserBarcode(barcodeUserData);
            })
          } else this.finishOnScanUserBarcode(barcodeUserData);
        }
      }
    }, (err) => {
      console.log("barcode err: ", err);
      this.errorHandler(this.ERROR_TYPES.PLUGIN.BARCODE)(err);
    });
  }

  finishOnScanUserBarcode(barcodeUserData: IBarcodeUserData) {
    this.barcodeUserData = barcodeUserData;
    this.getUserData(this.barcodeUserData.userOid, CONST_ID_TYPES.USER, {isSocialMediaUsed: this.barcodeUserData.isSocialMediaUsed, socialMediaType: this.barcodeUserData.socialMediaType});
  }

  presentAcceptOrRejectSocialMediaAlert(barcodeUserData: IBarcodeUserData): Promise<{isAccepted: boolean}> {
    return new Promise((resolve, reject) => {
      let acceptOrRejectSocialMediaAlert = this.alertCtrl.create({
        title: "Social Media Used!", 
        message: `Type of social media used: ${barcodeUserData.socialMediaType}`,
        buttons: [
          { text: "REJECT", handler: () => resolve({isAccepted: false})},
          { text: "ACCEPT", handler: () => resolve({isAccepted: true})}
        ]});
        acceptOrRejectSocialMediaAlert.present();
    });
  }

  presentEnterMobileCardIdModal() {
    let enterMobileCardIdModal = this.modalCtrl.create('EnterIDPage', { }, {enableBackdropDismiss: true, showBackdrop: true});
    enterMobileCardIdModal.onDidDismiss((data) => {
      if (data && data.mobileCardId) {
         this.getUserData(data.mobileCardId, this.ID_TYPES.MOBILE_CARD_ID);
         this.mobileCardId = data.mobileCardId;
      }
    });
    enterMobileCardIdModal.present();
  }

  completeOrderConfirmationModal() {
    return new Promise((resolve, reject) => {
      let completeOrderConfirmationModal = this.modalCtrl.create('CompleteOrderConfirmationPage', { hasPrinter: this.companyDetails.hasPrinter });
      completeOrderConfirmationModal.onDidDismiss((data) => resolve(data));
      completeOrderConfirmationModal.present();
    });
  }

  printReceiptCordova() {
    //this.presentLoading("Printing...");

    console.log("checking printer availability");
    this.printer.isAvailable()
      .then(() => {
        console.log("printer available...")
        return this.printer.pick();
      })
      /*
      .then(() => {
        console.log("about to pick...")
        return this.printer.pick();
      })
      */
      .then((data) => {
        console.log("about to print...");
        this.printer.print(ReceiptTemplates.generateReceiptHTML(this.order, this.auth), { name: 'Receipt', duplex: true, landscape: true, grayscale: true });
      })
      .then(() => {
        this.dismissLoading("Done Printing!");
        this.navCtrl.setRoot("TabsPage");
      })
      .catch(this.errorHandler(this.ERROR_TYPES.PLUGIN.PRINTER));
  }

  submit() {
    this.completeOrderConfirmationModal().then((data: IOrderConfirmation) => {
      if (!data) return;
      else if (data.isConfirmed) {
        this.presentLoading(AppViewData.getLoading().processing);
        let toData: IProcessOrderToData = { companyOid: this.auth.companyOid, locationOid: this.auth.locationOid, userOid: this.userData.userOid, userEmail: this.userData.email, isOrderAhead: false,eta: null,employeeComment: this.employeeComment,purchaseDate: DateUtils.toLocalIsoString(new Date().toString()),purchaseItems: this.order.purchaseItems,transactionDetails: this.order.transactionDetails};

        this.API.stack(ROUTES.processTransaction, "POST", toData)
          .subscribe( (response) => {
            if (data.doesWantReceipt && data.receiptType === this.RECEIPT_TYPES.EMAIL) {  // email
              this.API.stack(ROUTES.generateReceipt, "POST", { order: this.order, date: DateUtils.toLocalIsoString(new Date().toString()), companyOid: this.auth.companyOid, email: this.auth.email, userOid: this.userData.userOid})
                .subscribe( (response) => { 
                  this.finishSubmit();  
                }, this.errorHandler(this.ERROR_TYPES.API));  
            } else if (data.receiptType === this.RECEIPT_TYPES.PRINTER) this.printReceiptCordova();  // printer
              else this.finishSubmit();
          }, this.errorHandler(this.ERROR_TYPES.API));
        }
      });  
    } 

    finishSubmit(navToReceiptPage = false) {
      this.dismissLoading(AppViewData.getLoading().complete);
      this.navCtrl.setRoot("TabsPage");
    }     
}


/* local cache
-get all categories and products in background
-use cache if available
-use other queries if not available


categoriesCache: {
  0: {
    // category details
  }
}

productsCache: {
  0: {
    // product details
  }
}
*/









