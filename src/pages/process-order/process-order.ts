import { Component, ViewChild } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { AppUtils } from '../../utils/app-utils';
import { Utils } from '../../utils/utils';
import { IErrChecks, IOrder, IPurchaseItem, INameAndOid, IProductForProcessOrder, AuthUserInfo, ICompanyDetailsForProcessOrder, IEditSubtotalDismiss, IUserDataForProcessOrder } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Slides, LoadingController, ModalController } from 'ionic-angular';
import { AppData } from '../../global/app-data';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { ReceiptTemplates } from '../../global/receipt-templates';
import { COMPANY_DETAILS, ID_TYPES } from '../../global/global';
import { NativeNotifications } from '../../global/native-notifications';


// cloneDeep(this.purchaseItem)
// would rather copy by value with cloneDeep, but ionic?angular doesnt properly populate inputs with correct values
@IonicPage()
@Component({
  selector: 'page-process-order',
  templateUrl: 'process-order.html'
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
  currentIndex: number = 0;
  selectedCategory: any;
  coupons: Array<any> = [];
  products: Array<INameAndOid> = [];
  categories: Array<INameAndOid> = [];
  employeeComment: string = null;
  dairyQuantities = this.utils.getNumbersList(5);
  userData: IUserDataForProcessOrder = {
    userOid: null,
    email: null,
    companyOid: null,
    lkpSocialMediaTypeOid: null,
    isSocialMediaUsed: false,
    balance: 0
  };
  sufficientFunds: boolean = true;


/* Constants */
  COMPANY_DETAILS = COMPANY_DETAILS;
  ID_TYPES = ID_TYPES;
  REWARDS_TYPE = {
    REWARDS_INDIVIDUAL: "rewards_individual",
    REWARDS_ALL: "rewards_all"
  };
  REWARDS_PROCESSING_TYPE = {
    AUTOMATIC: "Automatic",
    MANUAL: "Manual"
  };
  REWARDS_DISCOUNT_RULE = {
    DATE_TIME_RANGE: "Date-Time-Range",
    PRODUCT: "Product"
  };
  REWARDS_DISCOUNT_TYPE = {
    MONEY: "Money",
    NEW_PRICE: "New Price",
    PERCENT: "Percent"
  }
  RECEIPT_TYPES = {
    EMAIL: "email",
    PRINTER: "printer",
    TEXT: "text message"
  }
  
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
      lkpSocialMediaTypeOid: null,
      socialMediaDiscountAmount: 0,
      isEdited: false,
      editAmount: 0,
      reasonsForEdit: null,
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
    addonsCost: null,
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
  quantities: Array<number> = this.utils.getNumbersList();

  isEditInProgress: any = {
    status: false,
    index: null
  }
  showRewardDescription: boolean = false;
  showRewards: boolean = false;
  showOrder: boolean = false;
  auth: AuthUserInfo;
  currentCategoryOid: number = null;
  currentCategoryName: string = null;
  currentCategoryImgSrc: string = null;
  currentProductOid: number;
  currentProductImgSrc: string = null;
  backgroundImg: string = 'url(../../../img/family.png) no-repeat;';   // will need to change this

  constructor(public navCtrl: NavController, public navParams: NavParams, public nativeNotifications: NativeNotifications, public appData: AppData, public dateUtils: DateUtils, public utils: Utils, public appUtils: AppUtils, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public receiptsTemplates: ReceiptTemplates) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);

    this.COMPANY_DETAILS = COMPANY_DETAILS;

  }

  ////////////////////////////////////////////////////////////// lifecycle methods //////////////////////////////////////////////////////////

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    
    this.getCompanyDetailsAPI();
  }

  ionViewDidEnter() {
    if (this.initHasRun) {
      this.getCompanyDetailsAPI();
    }
    this.initHasRun = true;
  }

// [compareWith]="compareFn"
  compareFn(c1, c2): boolean {
      return c1 && c2 ? c1.oid === c2.oid : c1 === c2;
  }

  findByOid(arr, oid) {
    if (arr.length) {
      return arr.find((x) => {
        return x.oid === oid;
      });
    }
  }

  slideChanged() {
      const isGoingBack = this.currentIndex > this.slides.getActiveIndex();
      this.currentIndex = this.slides.getActiveIndex();


      /* 
        1. All discounts change the subtotal, not product price. so clearing just resets subtotal to original value w/o discounts
        2. Every time slide changes from slide 1 to 2, rewards and freePurchaseItem recalculated

        if isGoingBack:  clears subtotal, rewardsSavings, rewards except for individual rewards, isEdited, reasonsForEdit
        
      */

      if (this.order.purchaseItems.length) {
        if (isGoingBack) {
          this.order.transactionDetails.isRewardUsed = false;
          this.order.transactionDetails.subtotal = this.utils.round(this.calculateSubtotal(this.order, this.COMPANY_DETAILS));
          this.order.transactionDetails.rewardsSavings = 0;
          this.order.transactionDetails.rewards = [...this.getIndividualRewards()];
          this.order.transactionDetails.isEdited = false;
          this.order.transactionDetails.reasonsForEdit = null;
          this.order.transactionDetails.editAmount = 0;

          this.order.purchaseItems.forEach((x, index) => {
            x.discounts = 0;
            x.isFreePurchaseItem = false;
            // x.displayPriceWithoutDiscounts = 0;
          });
          this.order.transactionDetails.rewards.forEach((x, index) => {
            x.discounts = 0;
          });

        } else {
            console.log("checking rewards....");
            this.getEligibleRewards();
        }
      }
  }

  btnSlideChange() {     
    this.currentIndex += 1;
    this.slides.slideNext();
  }


  //////////////////////////////////////////////// end lifecycle ///////////////////////////////////////////////////////





  ////////////////////////////////////////////////// APIs //////////////////////////////////////////////////////////////

  //API doesn't need to be async
  getCompanyDetailsAPI() {
    this.presentLoading();
    this.API.stack(ROUTES.getCompanyDetailsForTransaction, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.COMPANY_DETAILS.ACCEPTS_PARTIAL_PAYMENTS = response.data.companyDetails.acceptsPartialPayments;
              this.COMPANY_DETAILS.HAS_SOCIAL_MEDIA = response.data.companyDetails.hasSocialMedia;
              this.COMPANY_DETAILS.SOCIAL_MEDIA_DISCOUNT_AMOUNT = response.data.companyDetails.socialMediaDiscountAmount; 
              this.COMPANY_DETAILS.DOES_CHARGE_FOR_ADDONS = response.data.companyDetails.doesChargeForAddons; 
              this.COMPANY_DETAILS.TAX_RATE = response.data.companyDetails.taxRate; 
              this.COMPANY_DETAILS.HAS_PRINTER = response.data.companyDetails.hasPrinter;

              this.getCategoriesAPI();

            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  getCategoriesAPI() {
    this.API.stack(ROUTES.getCategories + `/${this.auth.companyOid}`, "GET")
        .subscribe(
            (response) => {
              console.log('response.data: ', response.data);
              this.dismissLoading();
              this.categories = response.data.categories;
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
    this.products = []; // reset products
  }

  onCategoryChangeGetProductsAPI(): void {
     this.API.stack(ROUTES.getProducts + `/${this.auth.companyOid}/${this.currentCategoryOid}`, "GET")
        .subscribe(
            (response) => {
              console.log('response.data: ' , response.data);
              this.products = response.data.products;
              this.productDetails = this.clearProductDetails();
              this.purchaseItem = this.clearPurchaseItem();
              this.canViewProducts = true;
            },  (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  onProductChangeGetProductInfoAPI(currentProductOid) {
     //let productOid = this.purchaseItem.selectedProduct.oid;

     this.API.stack(ROUTES.getProductDetails + `/${this.auth.companyOid}/${currentProductOid}`, "GET")
        .subscribe(
            (response) => {
              
              this.productDetails = response.data.productDetails;
              console.log('response.data: ' , response.data);
             // let { sizesAndPrices, addonsToClient, flavorsToClient, dairyToClient, varietyToClient, sweetenerToClient, oid, numberOfFreeAddonsUntilCharged, addonsPriceAboveLimit } = response.data.productDetails;

              // init size info
              if (!this.productDetails.sizesAndPrices.length && this.productDetails.fixedPrice) {
                this.purchaseItem.sizeAndOrPrice = {name: null, oid: null, price: this.productDetails.fixedPrice};
              }
            },  (err) => {
              const shouldPopView = false, shouldDismissLoading = false;
              this.errorHandler.call(this, err, shouldPopView, shouldDismissLoading)
            });
  }

  getUserDataForProcessOrderAPI(ID, type, socialMediaOpts = {lkpSocialMediaTypeOid: null, isSocialMediaUsed: false}) {
    this.presentLoading();
    let toData = { ID: ID, companyOid: this.auth.companyOid, type};

    // get user data
    this.API.stack(ROUTES.getUserDataForProcessOrder, "POST", toData)
      .subscribe(
          (response) => {
            console.log('response.data: ', response.data);
            this.dismissLoading();
            this.userData.userOid = response.data.userData.userOid;
            this.userData.balance = response.data.userData.balance;
            this.userData.companyOid = response.data.userData.companyOid;
            this.userData.email = response.data.userData.email;
            this.userData.lkpSocialMediaTypeOid = socialMediaOpts.lkpSocialMediaTypeOid;
            this.userData.isSocialMediaUsed = socialMediaOpts.isSocialMediaUsed;

            // do checks
            if (this.userData.balance < this.order.transactionDetails.total) {
              if (this.COMPANY_DETAILS.ACCEPTS_PARTIAL_PAYMENTS) {
                if (this.userData.isSocialMediaUsed) {
                  this.processSocialMediaDiscount();
                }
              } else {
                this.showPopup({
                  title: 'Uh oh!', 
                  message: "The customer doesn't have the proper funds. This company doesn't allow partial payments (application and cash/card).", 
                  buttons: [{text: "OK"}]
                });
                this.sufficientFunds = false;
              }
            } else {
              if (this.userData.isSocialMediaUsed) {
                this.processSocialMediaDiscount();
              }
            }
          }, (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView);
          });
  }


  //////////////////////////////////////////////////// end APIs //////////////////////////////////////////////////////////////////

  
  ////////////////////////////////////////////////   modals //////////////////////////////////////////////////

  presentReasonsForEditModal() {
    if (this.order.transactionDetails.reasonsForEdit && this.order.transactionDetails.reasonsForEdit.length) {
      this.presentModal('ReasonsForEditPage', {reasons: this.order.transactionDetails.reasonsForEdit})
    }
  }

  presentProductsModal() {
    let selectProductModal = this.modalCtrl.create('ProcessOrderProductsPage', { products: this.products });
    selectProductModal.onDidDismiss((data) => {
      if (data) {
        this.currentProductOid = data.oid;
        this.currentProductImgSrc = this.appData.getDisplayImgSrc(data.img);
        this.purchaseItem.selectedProduct = {oid: data.oid, name: data.name, imgSrc: this.currentProductImgSrc };
        this.onProductChangeGetProductInfoAPI(data.oid);
      }
    });
    selectProductModal.present();
  }

  presentCategoriesModal() {
    this.canViewProducts = false;

    let selectCategoryModal = this.modalCtrl.create('ProcessOrderCategoriesPage', { categories: this.categories });
    selectCategoryModal.onDidDismiss((data) => {
      if (data) {
        this.currentCategoryOid = data.oid;
        this.currentCategoryName = data.name;
        this.currentCategoryImgSrc = this.appData.getDisplayImgSrc(data.img);
        this.onCategoryChangeGetProductsAPI();
      }
    });
    selectCategoryModal.present();
  }

  presentEditSubtotalModal() {
    let editSubtotalModal = this.modalCtrl.create('EditSubtotalPage', { subtotal: this.order.transactionDetails.subtotal }, {enableBackdropDismiss: false});
    editSubtotalModal.onDidDismiss((data: IEditSubtotalDismiss) => {
      if (data.isEdited) {
        let reasonsForEdit = this.order.transactionDetails.reasonsForEdit.length ? this.order.transactionDetails.reasonsForEdit : [];
        let editAmount = this.calculateEditAmount(data.subtotal, data.cacheSubtotal);
        let priceDown = data.subtotal < data.cacheSubtotal ? true : false;

        
        this.order.transactionDetails.isEdited = true;
        this.order.transactionDetails.subtotal = data.subtotal;
        this.order.transactionDetails.editAmount += editAmount;
        this.order.transactionDetails.reasonsForEdit = [...reasonsForEdit, {reason: data.reasonForEdit, amount: editAmount, priceDown}];
        this.order.transactionDetails.taxes = this.calculateTaxes(this.order.transactionDetails.subtotal, this.COMPANY_DETAILS.TAX_RATE);
        this.order.transactionDetails.total = this.calculateTotal(this.order.transactionDetails.subtotal, this.order.transactionDetails.total);
      }
    });
    editSubtotalModal.present();
  }

  presentCommentModal() {
    let commentModal = this.modalCtrl.create('CommentPage', {comment: this.employeeComment}, {showBackdrop: true, enableBackdropDismiss: false});

    commentModal.onDidDismiss((data) => {
      if (data && data.comment) {
        this.employeeComment = data.comment;
      }
    });
    commentModal.present();
  }

  ///////////////////////////////////////////////////////////////// end modals /////////////////////////////////////////////////////


  onEditPurchaseItem(purchaseItem, index) {
    this.isEditInProgress = this.setEditInProgress(index);
    this.onProductChangeGetProductInfoAPI(purchaseItem.selectedProduct.oid);
    this.purchaseItem = purchaseItem;

  }

  finishEditPurchaseItem() {
    let index = this.isEditInProgress.index;

    this.order.purchaseItems[index] = this.purchaseItem;
    this.isEditInProgress = this.clearEditInProgress();
    this.purchaseItem = this.clearPurchaseItem();
    this.productDetails = this.clearProductDetails();

    // calculate addons
    if (this.order.purchaseItems[index].addonsCost) {
      this.order.purchaseItems[index].addonsCost = this.calculateAddonsCost(this.order.purchaseItems[index]);
    }

    // calculate dairy
    if (this.order.purchaseItems[index].dairyCost) {
      this.order.purchaseItems[index].dairyCost = this.calculateDairyCost(this.order.purchaseItems[index]);
    } 

    // calculate subtotal
    this.order.transactionDetails.subtotal = this.utils.round(this.calculateSubtotal(this.order, this.COMPANY_DETAILS));
  }

  setEditInProgress(index) {
    this.slides.lockSwipes(true);
    return { status: true, index: index }

  }

  clearEditInProgress() {
    this.slides.lockSwipes(false);
    return {status: false, index: null};
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
    } 
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

  doChecksPurchaseItem(purchaseItem): IErrChecks {
    let errs = [];

    if (!purchaseItem.selectedProduct.name) {
      errs.push('You forgot to select a product!');
      return {isValid: false, errs: errs};
    }
    if (!purchaseItem.sizeAndOrPrice.name && this.productDetails.sizesAndPrices.length) {
      errs.push('You forgot to select a size!');
      return {isValid: false, errs: errs};
    }
    return {isValid: true, errs};
  }


  /* work is done here */


  selectDairyQuantity(purchaseItemIndex, quantity) {
    this.purchaseItem.dairy[purchaseItemIndex].quantity = quantity;

    /*
    this.dairyQuantities.forEach(() => {

    })
    obj.isSelected = true;
    */
  }
  


  addToOrder(item): void {
    debugger;
    let checks = this.doChecksPurchaseItem(this.purchaseItem);
    
    if (!checks.isValid) {
      this.presentToast(false, {message: checks.errs.join(". "), position: "bottom", duration: 1500});
    }
    else {
      // const purchaseItem = cloneDeep(this.purchaseItem);   // not using
      this.presentToast(false, {message: "Added item!", position: "top", duration: 1500});

      // business logic
      this.purchaseItem.addonsCost = this.calculateAddonsCost(this.purchaseItem);
      this.purchaseItem.dairyCost = this.calculateDairyCost(this.purchaseItem);
      this.order.purchaseItems = [...this.order.purchaseItems, this.purchaseItem];
      this.order.transactionDetails.subtotal = this.utils.round(this.calculateSubtotal(this.order, this.COMPANY_DETAILS));

      // clear
      this.purchaseItem = this.clearPurchaseItem();
      this.productDetails = this.clearProductDetails();
    }
  }

  removePurchaseItemFromOrder(purchaseItem, index) {
    // have to clear edit in progress for now b/c <div> click is triggered on nested <button> click
    const confirmFn = () => {
      let item = this.order.purchaseItems[index];
      this.order.purchaseItems = this.order.purchaseItems.filter((x, i) => {
        return i !== index;
      });

      this.purchaseItem = this.clearPurchaseItem();
      this.productDetails = this.clearProductDetails();
      this.isEditInProgress = this.clearEditInProgress(); 
      this.order.transactionDetails.subtotal = this.utils.round(this.calculateSubtotal(this.order, this.COMPANY_DETAILS));

    }
    
    const cancelFn = () => {
      this.isEditInProgress = this.clearEditInProgress();
    }


    this.showPopup({
      title: "Please confirm",
      message: "Are you sure you want to remove this item?",
      buttons: [{text: this.appData.getPopup().defaultCancelButtonText, handler: cancelFn}, {text: this.appData.getPopup().defaultConfirmButtonText, handler: confirmFn}]
    });

  }

  getIndividualRewards(): Array<any> {
    const individualRewards = this.order.transactionDetails.rewards.filter((x) => {
      return x.type && x.type === this.REWARDS_TYPE.REWARDS_INDIVIDUAL;
    });

    return individualRewards;
  }


  getEligibleRewards() {
    this.presentLoading();

    const dateInfo = this.dateUtils.getCurrentDateInfo();
    const toData = {
      date: this.dateUtils.toLocalIsoString(dateInfo.date.toString()), // get all rewards where expiry date < date
      day: dateInfo.day, 
      hours: dateInfo.hours,
      mins: dateInfo.mins, 
      purchaseItems: this.order.purchaseItems,
      companyOid: this.auth.companyOid
    };

    console.log("toData: ", toData);

    this.API.stack(ROUTES.getEligibleRewardsProcessingTypeAutomaticForTransaction, "POST", toData )
      .subscribe(
          (response) => {
            console.log('response.data: ' , response.data);

            // OLD
            //this.order.transactionDetails.rewards = [...response.data.rewards, ...individualRewards]; // concat response and keep individual rewards
            //this.parseRewardsForTransaction();


            // if scan has already happened (i.e. employee scanned -> went back -> rewards recalculated)
            const individualRewards = this.getIndividualRewards();
            
            this.order.transactionDetails = response.data.transactionDetails;
            this.order.purchaseItems = response.data.purchaseItems;

            if (individualRewards.length) {
              this.order.transactionDetails.rewards = [...this.order.transactionDetails.rewards, ...individualRewards];
              this.order = this.calculateFreePurchaseItem(this.order);
            }

            this.order.transactionDetails.taxes = this.utils.round(this.calculateTaxes(this.order.transactionDetails.subtotal, this.COMPANY_DETAILS.TAX_RATE));
            this.order.transactionDetails.total = this.utils.round(this.calculateTotal(this.order.transactionDetails.subtotal, this.order.transactionDetails.taxes));
            this.dismissLoading();

          },  (err) => {
            const shouldPopView = false;
            this.errorHandler.call(this, err, shouldPopView)
          });
  }

  // this is optional- but helps with aggregating information about rewards used
  addManualRewardToTransaction() {
    // will do later
  }




  // slide 2

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  onScanIndividualRewardBarcode() {

    /////////////////////////////////////
    ///// cordova scan barcode //////////
    /////////////////////////////////////


    // either get these from barcode, or just get userOid and oid and look up info
    // only individual rewards can be scanned, so safe here
    let data = { 
      rewardIndividualOid: 0, 
      isFreePurchaseItem: true, 
      name: "Name of individual reward", 
      userOid: 4, 
      type: this.REWARDS_TYPE.REWARDS_INDIVIDUAL,  
      processingType: this.REWARDS_TYPE.REWARDS_INDIVIDUAL,
      isUsed: true   // SETS TO TRUE b/c I will set to false explicitly if not used in algorithm below
    };
    this.dataFromRewardIndividualBarcodeScan = data;
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    // add to rewards
    this.order.transactionDetails.rewards = [...this.order.transactionDetails.rewards, this.dataFromRewardIndividualBarcodeScan];
    
    if (this.dataFromRewardIndividualBarcodeScan.isFreePurchaseItem) {
      this.order = this.calculateFreePurchaseItem(this.order); 
    } else {
      // do nothing: don't support any other option right now
    }
  }


  // manual entering paymentID
  presentEnterUserPaymentIDModal() {
    // modal to enter digits
    // on dismiss: make api call to get userInfo
    let enterUserPaymentIDModal = this.modalCtrl.create('EnterIDPage', { }, {enableBackdropDismiss: true, showBackdrop: true});
    
    enterUserPaymentIDModal.onDidDismiss((data) => {
      if (data.paymentID) {
         // API get user info
         this.getUserDataForProcessOrderAPI(data.paymentID, this.ID_TYPES.PAYMENT);
      }
    });
    enterUserPaymentIDModal.present();
  }

  // barcode scanning
  onScanUserBarcode() {

    /////////////////////////////////////
    // cordova scan barcode.... fake data
    let data = { userOid: 4, email: "daniel@gmail.com", balance: 2.99, companyOid: 1, isSocialMediaUsed: true, lkpSocialMediaTypeOid: 2 };
    this.userData = {
      userOid: data.userOid, 
      balance: data.balance, 
      companyOid: data.companyOid, 
      email: data.email,
      isSocialMediaUsed: data.isSocialMediaUsed,
      lkpSocialMediaTypeOid: data.lkpSocialMediaTypeOid
    };
    ////////////////////////////////

    this.getUserDataForProcessOrderAPI(data.userOid, this.ID_TYPES.USER, {isSocialMediaUsed: data.isSocialMediaUsed, lkpSocialMediaTypeOid: data.lkpSocialMediaTypeOid});
    
  }

  processSocialMediaDiscount() {
    let socialMediaRewardsDiscount = this.COMPANY_DETAILS.SOCIAL_MEDIA_DISCOUNT_AMOUNT * this.order.transactionDetails.subtotal;

    // update subtotal and all social media properties
    this.order.transactionDetails.isSocialMediaUsed = true;
    this.order.transactionDetails.lkpSocialMediaTypeOid = this.userData.lkpSocialMediaTypeOid;
    this.order.transactionDetails.subtotal -= socialMediaRewardsDiscount;
    this.order.transactionDetails.taxes = this.calculateTaxes(this.order.transactionDetails.subtotal, this.COMPANY_DETAILS.TAX_RATE);
    this.order.transactionDetails.total = this.calculateTotal(this.order.transactionDetails.subtotal, this.order.transactionDetails.taxes);
    this.order.transactionDetails.rewardsSavings += socialMediaRewardsDiscount;
  }

  calculateFreePurchaseItem(order: IOrder): IOrder {
    let highItem: IPurchaseItem = {
      selectedProduct: {oid: null, name: null, imgSrc: null},
      sizeAndOrPrice: { oid: null, name: null, price: null},
      fixedPrice: null,
      quantity: null,
      addons: [],
      flavors: [],
      discounts: null,
      isFreePurchaseItem: false
    };
    let highItemPrice: number = 0;
    let index: number = 0;

    order.purchaseItems.forEach((x, i) => {
      if (x.sizeAndOrPrice.price > highItemPrice) {
          highItem = Object.assign({}, x);
          highItemPrice = x.sizeAndOrPrice.price;
          index = i;
      }
    });

    // account for discounts already on it
    if (highItem.discounts > 0) {
      highItemPrice -= highItem.discounts;
    } 

    order.purchaseItems[index].discounts += highItemPrice;
    order.purchaseItems[index].isFreePurchaseItem = true;
    order.transactionDetails.rewardsSavings += highItemPrice;
    order.transactionDetails.subtotal -= highItemPrice;

    return order;
  }


  calculateSubtotal(order: IOrder, COMPANY_DETAILS: ICompanyDetailsForProcessOrder): number {
      this.order.transactionDetails.subtotal = 0;
      order.purchaseItems.forEach((x, index) => {
          let addonsCost = x.addonsCost !== null ? x.addonsCost : 0;
          let dairyCost = x.dairyCost !== null ? x.dairyCost: 0;

          //TODO: not sure i need displayPriceWithoutDiscounts here b/c its done on server, look into this later
          x.displayPriceWithoutDiscounts = (x.sizeAndOrPrice.price * x.quantity) + (x.addonsCost * x.quantity) + (x.dairyCost);
          order.transactionDetails.subtotal += (x.sizeAndOrPrice.price * x.quantity) + (addonsCost * x.quantity) + (x.dairyCost);
      });
      
      return this.utils.round(order.transactionDetails.subtotal);
  }

  calculateAddonsCost(purchaseItem: IPurchaseItem): number {
    let addonsCost = 0;
    if (purchaseItem.addons && purchaseItem.addons.length) {
      if (this.COMPANY_DETAILS.DOES_CHARGE_FOR_ADDONS && this.productDetails.numberOfFreeAddonsUntilCharged !== null) {
          if (purchaseItem.addons.length > this.productDetails.numberOfFreeAddonsUntilCharged) {
              let numberOfChargedAddons = purchaseItem.addons.length - this.productDetails.numberOfFreeAddonsUntilCharged;
              addonsCost = numberOfChargedAddons * this.productDetails.addonsPriceAboveLimit;

              return addonsCost;
          }
      }
    }
    return addonsCost;
  }

  public calculateDairyCost(purchaseItem): number {
      let dairyCost = 0;
      if (purchaseItem.dairy && purchaseItem.dairy.length) {
          purchaseItem.dairy.forEach((x) => {
              dairyCost += x.price;
          });
      }

      return dairyCost;
  }

  calculateTaxes(subtotal: number, TAX_RATE: number): number {
    return subtotal * TAX_RATE;
  }

  calculateTotal(subtotal: number, taxes: number): number {
    return subtotal + taxes;
  }
  
  calculateEditAmount(subtotal: number, editAmount: number) {
    return subtotal - editAmount;
  }


  onEditSubtotal() {
    this.orderHasBeenEdited = true;
    this.presentEditSubtotalModal();
  }


  completeOrderConfirmationModal() {
    console.log("about to hit promise");
    return new Promise((resolve, reject) => {

      let completeOrderConfirmationModal = this.modalCtrl.create('CompleteOrderConfirmationPage', { hasPrinter: this.COMPANY_DETAILS.HAS_PRINTER });
      completeOrderConfirmationModal.onDidDismiss((data) => {
        resolve(data);
      });
      completeOrderConfirmationModal.present();

    });
  }


  cordovaPrinter() {

      this.presentLoading("Printing...");
      const receiptHTML = this.receiptsTemplates.generateReceiptHTML(this.order, this.auth);
      
       //////////////// Cordova printer plugin ///////////////////////////////

       //this.showReceiptModalWhilePrinting();
       
       /* inside printer promise
        //  this.dismissLoading("Done!");
        // this.navCtrl.setRoot(TabsPage);
       */

      setTimeout(() => {
        this.dismissLoading("Done!");
      }, 1000)

      ////////////////// end cordova printer plugin ////////////////////////////

  }

  finishSubmit(navToReceiptPage = false) {
    this.dismissLoading(this.appData.getLoading().complete);

    if (!navToReceiptPage) {
       this.navCtrl.setRoot('TabsPage');
    } /* else {
      this.showReceiptModalWhilePrinting();
    } */
  }

  submit() {
    // popup are you sure?/receipt options
    this.completeOrderConfirmationModal().then((data: IOrderConfirmation) => {
        console.log("dismissed and inside of .then");
        if (!data) return;
        if (data.isConfirmed) {
          this.presentLoading(this.appData.getLoading().processing);

          let toData = { 
            companyOid: this.auth.companyOid, 
            locationOid: this.auth.locationOid, 
            userOid: this.userData.userOid,
            userEmail: this.userData.email,
            isOrderAhead: false,
            eta: null,
            employeeComment: this.employeeComment,
            purchaseDate: this.dateUtils.toLocalIsoString(new Date().toString()),
            purchaseItems: this.order.purchaseItems,
            transactionDetails: this.order.transactionDetails
          };

          console.log("toData: ", toData);

          // process transaction
          this.API.stack(ROUTES.processTransaction, "POST", toData)
            .subscribe(
                (response) => {
                  console.log("response: ", response.data);
                  if (data.doesWantReceipt) {
                    if (data.receiptType === this.RECEIPT_TYPES.EMAIL) {
                      // send email
                      this.API.stack(ROUTES.generateReceipt, "POST", {
                            order: this.order, 
                            date: this.dateUtils.toLocalIsoString(new Date().toString()), 
                            companyOid: this.auth.companyOid, 
                            email: this.auth.email, 
                            userOid: this.userData.userOid
                        })
                        .subscribe(
                          (response) => {
                            console.log("response: ", response.data);
                            this.finishSubmit();  
                        },(err) => {
                          console.log("err: ", err);
                          const shouldPopView = false;
                          this.errorHandler.call(this, err, shouldPopView);
                        });  
                    } else if (data.receiptType === this.RECEIPT_TYPES.PRINTER) {
                      this.cordovaPrinter();
                    }
                  } else {
                    this.finishSubmit();
                  }
                }, (err) => {
                  console.log("err: ", err);
                  const shouldPopView = false;
                  this.errorHandler.call(this, err, shouldPopView);
                });
        }
      });
        
    }
        
}

interface IOrderConfirmation {
  isConfirmed:boolean;
  doesWantReceipt:boolean;
  receiptType?:string
}



// not used... may use later


/*
  onRejectReward(reward: IReward, index: number) {
    // modal- are you sure?  with input for rejection comments
    const reason = "from modal-- the reason it was rejected.";

    // filter out of rewards
    this.order.transactionDetails.rewards = this.order.transactionDetails.rewards.filter((x) => {
      return x.oid !== reward.oid 
    });
    // push onto rewardsRejected
    this.order.transactionDetails.rewardsRejected = [...this.order.transactionDetails.rewardsRejected, {name: reward.name, oid: reward.oid, reason}]
  }
*/




/*
  selectFreePurchaseItem(index) {
    //this.presentFreePurchaseItemModal(index);
  }
*/


/*
  presentFreePurchaseItemModal(index) {
    
    const freePurchaseItemModal = this.modalCtrl.create(FreePurchaseItemPage, {purchaseItems: this.order.purchaseItems}, {enableBackdropDismiss: true});
    
    freePurchaseItemModal.onDidDismiss(data => {
      if (data.isFreePurchaseItemSelected) {
        this.order.transactionDetails.rewards[index].isUsed = true;
        this.order.transactionDetails.reasonsForEdit = "Individual reward: free purchase item.";

        // loop through this.order.purchaseItems to find data.selectedFreePurchaseItemOid
        let freePurchaseItem = this.order.purchaseItems.find((x) => {
          return x.selectedProduct.oid === data.selectedFreePurchaseItemOid;
        });
        this.order.transactionDetails.rewardsSavings += freePurchaseItem.sizeAndOrPrice.price;
        freePurchaseItem.sizeAndOrPrice.price = 0;  // make free

        this.calculateSubtotal();

      } else {
          this.order.transactionDetails.rewards[index].isUsed = false;
      }
    });

    freePurchaseItemModal.present();
  }
*/



// EVERYTHING BELOW IS NOW ON THE SERVER

  /*
  parseRewardsForTransaction() {
   
    let {rewards, subtotal} = this.order.transactionDetails;
    let dateTimeRangeMoneyOff = 0;
    let dateTimeRangePercentOff = 0;
    let dtrPercentSavings = 0;
    let hasFreePurchaseItemReward: boolean = false;
    let freePurchaseItemDiscountAmount: number = 0;

    if (rewards.length)  {
      this.order.transactionDetails.isRewardUsed = true;

      rewards.forEach((reward, index) => {
        if (reward.processingType === this.REWARDS_PROCESSING_TYPE.AUTOMATIC && reward.type === this.REWARDS_TYPE.REWARDS_ALL) {
          if (reward.discountRule === this.REWARDS_DISCOUNT_RULE.PRODUCT) {
            this.rewardTypeProductAction(reward);
          } else if (reward.discountRule === this.REWARDS_DISCOUNT_RULE.DATE_TIME_RANGE) {
              if (reward.discountType === this.REWARDS_DISCOUNT_TYPE.MONEY) {
                  dateTimeRangeMoneyOff += this.rewardTypeDateTimeRangeAction(reward).money;
                  reward.discount = {type: this.REWARDS_DISCOUNT_TYPE.MONEY, amount: reward.discountAmount};
              } else if (reward.discountType === this.REWARDS_DISCOUNT_TYPE.PERCENT) {
                  dateTimeRangePercentOff += this.rewardTypeDateTimeRangeAction(reward).percent;
                  reward.discount = {type: this.REWARDS_DISCOUNT_TYPE.PERCENT, amount: reward.discountAmount * 100};
              }
          } else if (reward.type === this.REWARDS_TYPE.REWARDS_INDIVIDUAL && reward.isFreePurchaseItem) {  // limited to one per transaction at the moment
              hasFreePurchaseItemReward = true;
          }
        }
      });

      // DO CALCULATIONS   (need to clean this up)

      // cache products discounts
      const allProductsDiscounts = this.calculateAllProductsDiscounts();


      // free purchase item
      if (hasFreePurchaseItemReward) {
        freePurchaseItemDiscountAmount = this.calculateFreePurchaseItem();
      }

      // calculate subtotal
      this.order.transactionDetails.subtotal = UtilityService.round(this.order.transactionDetails.subtotal - (allProductsDiscounts + freePurchaseItemDiscountAmount + dateTimeRangeMoneyOff));
      if (this.order.transactionDetails.subtotal < 0) this.order.transactionDetails.subtotal = 0;


      // calculate dtr percentage for whole order
      if (dateTimeRangePercentOff > 0) {
        dtrPercentSavings = this.order.transactionDetails.subtotal * dateTimeRangePercentOff;
        this.order.transactionDetails.subtotal = UtilityService.round(this.order.transactionDetails.subtotal - dtrPercentSavings);
      }

      // calculate total rewards savings
      this.order.transactionDetails.rewardsSavings = UtilityService.round((allProductsDiscounts  + freePurchaseItemDiscountAmount + dateTimeRangeMoneyOff + dtrPercentSavings));
    }
  }

// rewards action:   PRODUCT

  rewardTypeProductAction(reward) {
    this.order.purchaseItems.forEach((purchaseItem, index) => {
        if (purchaseItem.selectedProduct.oid === reward.productOid) {
          let originalPrice = purchaseItem.sizeAndOrPrice.price, 
              newPrice = 0, 
              newDiscount = 0;

          if (purchaseItem.discounts === null || purchaseItem.discounts === undefined) {
             purchaseItem.discounts = 0;  // catch
             console.log("caught bug -- purchaseItem.discounts was undefined");
          }
         
          switch (reward.discountType) {
            case this.REWARDS_DISCOUNT_TYPE.MONEY:
              purchaseItem.discounts += (this.quantityTimesDiscount(purchaseItem.quantity, reward.discountAmount));
              purchaseItem.discounts = this.returnDiscountOrOriginalPrice(purchaseItem.discounts, originalPrice, purchaseItem.quantity);
              break;
            case this.REWARDS_DISCOUNT_TYPE.PERCENT:
              newPrice = originalPrice * (this.quantityTimesDiscount(purchaseItem.quantity, reward.discountAmount));
              newDiscount = purchaseItem.discounts + (originalPrice - newPrice);
              purchaseItem.discounts = this.returnDiscountOrOriginalPrice(newDiscount, originalPrice, purchaseItem.quantity);
              break;
            case this.REWARDS_DISCOUNT_TYPE.NEW_PRICE:
              newDiscount = purchaseItem.discounts  + this.quantityTimesDiscount(purchaseItem.quantity, originalPrice);
              purchaseItem.discounts = this.returnDiscountOrOriginalPrice(newDiscount, originalPrice, purchaseItem.quantity);
              break;
            default: 
              // do nothing
              break;
          }
        }
      }); 
  }
  

// rewards action: DATE-TIME-RANGE 
  rewardTypeDateTimeRangeAction(reward): {money: number, percent: number} {
    let ret = { money: 0, percent: 0 };
    
    switch (reward.discountType) {
      case this.REWARDS_DISCOUNT_TYPE.MONEY:
        ret = {money: reward.discountAmount, percent: 0};
        break;
      case this.REWARDS_DISCOUNT_TYPE.PERCENT:
        ret = {percent: reward.discountAmount, money: 0};
        break;
      default: 
        break; 
    }

    return ret;
  }

  calculateAllProductsDiscounts(): number {
    let discounts = 0;

    this.order.purchaseItems.forEach((x, index) => {
      discounts += x.discounts;
    });

    return discounts;
  }


 // rewards algorithm helpers 
  quantityTimesDiscount(num: number, amount: number) {
    return num * amount;
  }


  returnDiscountOrOriginalPrice(newDiscount: number, originalPrice: number, quantity: number): number {
    if (newDiscount > (originalPrice * quantity)) return originalPrice;
    else return newDiscount;
  }

  
  */



