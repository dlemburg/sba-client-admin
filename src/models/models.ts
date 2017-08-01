import { Component } from '@angular/core';

export interface ILocation {
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: number|string;
    phoneNumber: string;
    coordsLat: number;
    coordsLong: number;
    sundayOpen: string;
    sundayClose: string;
    mondayOpen: string;
    mondayClose: string;
    tuesdayOpen: string;
    tuesdayClose: string;
    wednesdayOpen: string;
    wednesdayClose: string;
    thursdayOpen: string;
    thursdayClose: string;
    fridayOpen: string;
    fridayClose: string;
    saturdayOpen: string;
    saturdayClose: string;
}

export interface ICard {

}

export interface IOrder {
    purchaseItems: Array<IPurchaseItem>;
    transactionDetails: ITransactionDetails;
}

export interface ITransactionDetails {
    purchaseDate?: string|Date;
    location?: string;
    isRewardUsed: boolean;
    isRewardAllUsed: boolean;
    isRewardIndividualUsed: boolean;
    isOrderAhead?: boolean;
    rewards: Array<any>;   // just give them brief description here -> can click on it
    subtotal: number;
    total: number;
    taxes: number;
    rewardsSavings: number;
    isSocialMediaUsed: boolean;
    socialMediaType: string;
    socialMediaPointsBonus?: number;
    isEdited: boolean;
    editAmount: number;
    reasonsForEdit: Array<any>;
    oldPrice: number;
    newPrice: number;
}

export interface IReasonsForEdit {
    reason: string;
    amount: number;
    priceDown: boolean;
}

export interface IEditSubtotalDismiss {
    isEdited: boolean;
    subtotal: number; 
    cacheSubtotal: number; 
    reasonForEdit: string;
}
export interface ICompanyDetailsForProcessOrder {
    HAS_SOCIAL_MEDIA: boolean;
    ACCEPTS_PARTIAL_PAYMENTS: boolean;
    SOCIAL_MEDIA_POINTS_BONUS: number;
    TAX_RATE: number;
    DOES_CHARGE_FOR_ADDONS: boolean;
    HAS_PRINTER: boolean;
    //NUMBER_OF_ADDONS_UNTIL_CHARGED: number;
    //ADDONS_PRICE_ABOVE_LIMIT: number;
}

export interface ICompanyDetails {

}

export interface IDiscountApplied {
    type: string;
    reason: string;
    amount: number;
}

export interface IPayload {
    userOid: string;
    pushToken?: string;
    role: string;
    name: string;
    email: string;
    expiry: string;
    companyOid?: number;
}

export interface AuthUserInfo {
    userOid: number;
    pushToken?: string;
    role: string;
    companyName: string;
    email: string;
    expiry: string;
    companyOid?: number;
    locationOid: number;
    acceptsPartialPayments: boolean;
}

export interface ITransaction {
    date: string|Date;
    name: string;
    details?: string;
    oid: number;
    price: number;
    isEdited: boolean
}

export interface ITransactionDetailsOwner {
    purchaseDate: string|Date;
    location: string;
    order: any;             // not sure how i want to handle it yet
    isRewardUsed: boolean;
    isRewardAllUsed: boolean;
    isRewardIndividualUsed: boolean;
    isRewardRejected: boolean;
    rewards: Array<IReward>;   // just give them brief description here -> can click on it
    products: any;
    price: number;
    subtotal: number;
    total: number;
    taxes: number;
    isEdited: boolean;
    isEditedReason?: string;
    isEditedAmount?: number;
    oldPrice?: number;
    newPrice?: number;
    isSocialMediaDiscount?: boolean;
}

export interface IPurchaseItem {
    selectedProduct: INameOidImgSrc;
    sizeAndOrPrice: INameOidPrice;
    fixedPrice?: number;
    quantity: number;
    addons?: Array<any>;
    dairy?: Array<any>;
    sweetener?: Array<any>;
    variety?: Array<any>;
    flavors?: Array<any>;
    addonsCost?: number;
    dairyCost?: number;
    discounts?: number;
    isFreePurchaseItem?: boolean;
    displayPriceWithoutDiscounts?: number; // quantity, sizeAndOrPrice.price, addonsCost
}

export interface IReward {
    img: string;
    description: string;
    name: string;
    startDate: string|Date;
    expiryDate: string|Date;
    oid: number;
    discountAmount?: number;   // this is only for process-order display purposes
}

export interface IRewardForRewardsList {
    img: string;
    imgSrc: string;
    description: string;
    name: string;
    startDate: string|Date;
    expiryDate: string|Date;
    oid: number;
    processingType: string;
}

export interface IRewardDetailsOwner {
    name: string;
    img: string;
    description: string;
    title: string;
    startDate: string|Date;
    expiryDate: string|Date;
    processingType: string;
    discountType: string;
    discountAmount: number;
    discountRule: string;
    oid: number;     // reward
    productOid?: number;
    dateRuleDays?:  string;           
    dateRuleTimeStart?: string|Date;
    dateRuleTimeEnd?: string|Date;
    price?: number;
    newPrice?: number;    // not in db, calculate on server
}

export interface Ihttp {
    route: string;
    method: string;
    body?: any;
}

export interface IValidatorInfo {
    validatorProp: string
    validatorValue?: any;   // will be object
    validatorOptions?: string;
}

export interface IErrChecks {
    errs: Array<any>;
    isValid: boolean;
}

export interface ITotals { 
    subtotal: number;
    rewardsDiscounts: number;
    taxes: number;
    total: number;
}

export interface IProductOptions {
    name: string;
    companyOid: number;
    oid: number;
}

export interface IProductForProcessOrder {
    sizesAndPrices?: Array<INameOidPrice>;
    addonsToClient?: Array<INameAndOid>;
    flavorsToClient?: Array<INameAndOid>;
    dairyToClient?: Array<any>,
    varietyToClient?: Array<INameAndOid>,
    sweetenerToClient?: Array<INameAndOid>,
    fixedPrice?: number;
    oid: number;
    numberOfFreeAddonsUntilCharged?: number;
    addonsPriceAboveLimit?: number;
}

export interface Dairy {
    oid: number;
    name: string;
    price: number;
    hasQuantity: boolean;
    quantity: number;
}

export interface INameOidReason {
    name: string;
    oid: number;
    reason: string;
}

export interface INameImg {
    name: string;
    img: string;
}

export interface INameOidCompanyOid {
    name: string;
    companyOid: number;
    oid: number;
}

export interface INameOidPrice {
    name?: string;
    oid?: number;
    price?: number;
}

export interface INameAndOid {
    oid: number;
    name: string;
}

export interface INameOidImgSrc {
    oid: number;
    name: string;
    imgSrc: string;
}

export interface ILkp {
    value: string|number;
    oid: number;
}

export interface IPopup {
    title: string;
    subTitle?: string;
    message: string;
    inputs?: any;
    buttons: Array<any>;
    enableBackdropDismiss?: boolean
}

export interface INameAndComponent {
    name: string;
    component: Component;
    type?: string;
}

export interface IOrderAhead {
    purchaseDate: string; 
    eta: number;
    orderDetails: string; 
    isProcessing: boolean;
    isActive: boolean;
    arrivalDate: Date;
    arrivalMins: string|number;
    arrivalSeconds: string|number;
    showOrderDetails: boolean;
    isExpired: boolean;
    transactionOid: number;
    userOid: number;
}

export interface ICurrentDateInfo {
    date: Date;
    hours: number;
    mins: number;
    day: number;
}

export interface ISelectLocation {
    name: string;
    oid: number;
    hasPassword: boolean;
}


export interface SocketEvents {
    subscribe: string;
    unsubscribe: string;
    userPlacedNewOrder: string;  // user emit
    incomingNewOrder: string;    // location listener
    alertUserProcessingOrder: string;  // user listener
    locationIsProcessingOrder: string;  // location emit
}


export interface IUserDataForProcessOrder {
    userOid: number;
    balance: number;
    email: string;
    companyOid: number;
    isSocialMediaUsed?: boolean;
    socialMediaType?: string;
}


export interface IBarcodeRewardData {
  rewardOid: number;
  isFreePurchaseItem: boolean;
  userOid: number;
}

export interface IBarcodeUserData {
    userOid: number; 
    companyOid: number;
    isSocialMediaUsed: boolean;
    socialMediaType: number;
}


export interface IErrorHandlerOpts {
  shouldPopView?: boolean
  shouldDismissLoading?: boolean
}

export interface ICompanyDetails {
    doesChargeForDairy?: boolean;
    doesChargeForAddons?: boolean;
    hasDairy?: boolean;
    hasVariety?: boolean;
    hasSweetener?: boolean;
    hasAddons?: boolean;
    hasFlavors?: boolean;
    acceptsPartialPayments?: boolean;
    taxRate?: number;
    hasPrinter?: boolean;
    hasSocialMediaRewards?: boolean;
    hasFacebook?: boolean;
    hasTwitter?: boolean;
    hasInstagram?: boolean;
    socialMediaPointsBonus?: boolean;
    socialMediaMessage?: string;
    socialMediaImg?: string;
    allowsCommentsOnOrderAhead?: boolean;
}

export interface IGetEligibleRewardsToData {
    date: string;
    day: number;
    hours: number;
    mins: number;
    purchaseItems: Array<IPurchaseItem>;
    companyOid: number;
    taxRate: number;
    individualRewards?: Array<IReward>
}

export interface ILogError {
    date: string;
    timezoneOffset: number;
    app: string;
    type: string;
    companyOid: number;
    userOid: number;
    err: string;
    url: string;
    httpVerb: string;
}

export interface IClientAdminAppStartupInfoResponse {
  hasProcessOrder: boolean;
  logoImg: string;
  defaultImg: string;
  currentClientAdminVersionNumber: number;
  minClientAdminVersionNumber: number;
  mustUpdateClientAdminApp: boolean;
}

export interface IProcessOrderToData {
    companyOid: number;
    locationOid: number; 
    userOid: number;
    userEmail: string;
    isOrderAhead: boolean;
    eta: number;
    employeeComment: string;
    purchaseDate: string;
    purchaseItems: Array<IPurchaseItem>;
    transactionDetails: ITransactionDetails;
}

export interface IOrderConfirmation {
  isConfirmed:boolean;
  doesWantReceipt:boolean;
  receiptType?:string
}
