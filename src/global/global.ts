// operation constants
export const env = { development: false };
export const SERVER_URL_NODE = env.development ? 'http://192.168.1.76:2800' : 'http://localhost:2800';   /* 'http://localhost:2800' : 'http://192.168.1.76:2800'; */
export const SERVER_URL_CSHARP = env.development ?  'http://192.168.1.254:2345'  : 'http://localhost:2345'   /* 'http://localhost:60158' :  'http://192.168.1.76:60158'; */
export const TOKEN_NAME = "sba-admin";


// app constants
export const prependImgString = 'data:image/jpeg;base64,';
export const DEFAULT_IMG = 'img/default.png';


// app data constants
export const PASSWORD_TYPES = {
    OWNER: "Owner",
    ADMIN: "Admin",
    PIN: "Pin"
}

export const ID_TYPES = {
    PAYMENT: "payment",
    USER: "user"
}
export const COMPANY_DETAILS = {
    HAS_DAIRY: false,
    HAS_VARIETY: false,
    HAS_SWEETENER: false,
    HAS_FLAVORS: false,
    HAS_ADDONS: false,
    HAS_SOCIAL_MEDIA : false,
    ACCEPTS_PARTIAL_PAYMENTS : false,
    SOCIAL_MEDIA_DISCOUNT_AMOUNT : 0,
    TAX_RATE: 0,
    DOES_CHARGE_FOR_ADDONS: false,
    HAS_PRINTER: false
}

export const APP_IMGS = {
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
    12: 'addedToCartBackgroundImg'

}
