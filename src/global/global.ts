// operation constants
export const ENV = { development: true };
export const SERVER_URL_NODE = ENV.development ? 'http://localhost:2800' : null   /* 'http://localhost:2800' : 'http://192.168.1.76:2800'; */
export const SERVER_URL_CSHARP = ENV.development ? 'http://localhost:2345' : null   /* 'http://localhost:60158' :  'http://192.168.1.76:60158'; */
export const CONST_TOKEN_NAME = "sba-admin";


// app constants
export const prependImgString = 'data:image/jpeg;base64,';
export const DEFAULT_IMG = 'img/default.png';


// app data constants

export const CONST_ID_TYPES = {
    PAYMENT: "payment",
    USER: "user"
}

export const CONST_PROCESSING_TYPE: any = {
    AUTOMATIC: 'Automatic', 
    MANUAL: 'Manual'
};
 export const CONST_DISCOUNT_TYPE: any = {
    MONEY: 'Money',
    NEWPRICE: 'New Price',
    PERCENT: 'Percent'
};
export const CONST_DISCOUNT_RULE: any = {  
    PRODUCT: 'Product',
    DATE: 'Date-Time-Range'
};
export const CONST_PASSWORD_TYPES = {
    OWNER: "Owner",
    ADMIN: "Admin",
    PIN: "Pin"
}
export const CONST_REWARDS_PROCESSING_TYPE = {
    AUTOMATIC: "Automatic",
    MANUAL: "Manual"
};
export const CONST_REWARDS_DISCOUNT_RULE = {
    DATE_TIME_RANGE: "Date-Time-Range",
    PRODUCT: "Product"
};
export const CONST_REWARDS_DISCOUNT_TYPE = {
    MONEY: "Money",
    NEW_PRICE: "New Price",
    PERCENT: "Percent"
}
export const CONST_REWARDS_TYPES = {
    REWARDS_INDIVIDUAL: "rewards_individual",
    REWARDS_ALL: "rewards_all"
}
export const CONST_APP_IMGS = {
    0: 'homeMyCardImg',
    1: 'homeRewardsImg',
    2: 'homeOrderAheadImg',
    3: 'homeMenuImg',
    4: 'logoImg',
    5: 'appHeaderBarImg',
    6: 'defaultImg',
    7: 'rewardsPageImg',
    8: 'loginPageBackgroundImg',
    9: 'orderCompleteBackgroundImg',
    10: 'orderCompleteMiddleOfPageImg',
    11: 'mobileCardImg',
    12: 'addedToCartBackgroundImg',
    13: 'socialMediaImg',
    14: 'categoryImg',
    15: 'productImg',
    16: 'rewardImg',
    17: 'rewardIndividualImg',
    18: 'locationImg'
}

export const CONST_RECEIPT_TYPES = {
    EMAIL: "email",
    PRINTER: "printer",
    TEXT: "text message"
  }
