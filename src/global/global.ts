// operation constants
export const env = { development: false };
export const SERVER_URL_NODE = env.development ? 'http://192.168.1.76:2800' : 'http://localhost:2800';   /* 'http://localhost:2800' : 'http://192.168.1.76:2800'; */
export const SERVER_URL_CSHARP = env.development ?  'http://192.168.1.254:2345'  : 'http://localhost:2345'   /* 'http://localhost:60158' :  'http://192.168.1.76:60158'; */
export const TOKEN_NAME = "sba-admin";


// app constants
export const prependImgString = 'data:image/jpeg;base64,';
export const defaultImg = 'img/default.png';
export const companyOid: number = 1;


// app data constants
export const PASSWORD_TYPES = {
    OWNER: "Owner",
    ADMIN: "Admin",
    PIN: "Pin"
}
export const COMPANY_DETAILS = {
    HAS_DAIRY: false,
    HAS_VARIETY: false,
    HAS_SWEETENER: false,
    HAS_FLAVORS: false,
    HAS_ADDONS: false
}