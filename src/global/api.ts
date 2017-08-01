import { Injectable, ErrorHandler } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import * as global from './global';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { Authentication } from '../global/authentication';
import { Ihttp, ILogError } from '../models/models';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class API implements ErrorHandler {
    token;
    headers;
    options;
    auth;
    logErrorAttempts = 0;

    constructor(private http: Http, public authentication: Authentication) {}

    public stack(route: string, verb: string, body: any = {}): Observable<any> {
        this.auth =  this.authentication.getCurrentUser();
        this.token = this.authentication.getToken();
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${this.token}`);
        let options = new RequestOptions({ headers: headers });


        /*
            .NET server is fine with Authorization being set as a header on GET requests,
            Node.js server is not. So anytime I need to verify token on GET request for node 
            server, i'll have to send it as a query param, and access it on server side as req.query (or params?).
            this means i'll have to add one more layer of abstraction here to account for it, as well as 
            auth middleware on server side to account for GET -> req.query (or params?)  vs  POST req.headers

        */
        let isOnline = window.navigator.onLine;
        let url: string = route.indexOf('/api/node/') > -1 ? global.SERVER_URL_NODE : global.SERVER_URL_CSHARP;
            url += route;
        const httpVerb = verb.toLowerCase();

        if (httpVerb === "post") {
            return this.http[httpVerb](url, body, options)
                    .map((response: Response) => response.json())
                    .catch((err) => {
                        if (!isOnline) return Observable.throw("NOT_ONLINE")
                        else {
                            this.logError({err, url, httpVerb, type: "API"});
                            return Observable.throw(err);
                        }
                    });
        } else if (httpVerb === "get") {
            return this.http[httpVerb](url, options)
                    .map((response: Response) => response.json())
                    .catch((err) => {
                         if (!isOnline) return Observable.throw("NOT_ONLINE")
                         else {
                             this.logError({err, url, httpVerb, type: "API"});
                             return Observable.throw(err);
                         }
                    });
        }
    }
    /* these error handlers don't interact with the view. when they are done, they forward error to view-error-handler
        in BaseViewController. Easiest way to do this was to stick these in this class. 
    */

    // handles APP-WIDE errors
    public handleError(err: any) {
        console.log(" %c err (logger): "  + err, "color: red;");

        if (!global.ENV.development) {
            this.logError({type: "Javascript runtime error!", err})
        }
    }

    // app-wide and API errors get sent here
    public logError(args?): any {   
        let err = args.err;

        if ((args.err.status === 0 && args.type === "API") || args.type !== "API") {
            err = "ERR_CONNECTION_REFUSED";
    
            if (this.logErrorAttempts === 1 && args.type === "API") {
                this.logErrorAttempts = 0;
                return;
            }
            else this.logErrorAttempts++;

            const toData: ILogError = {
                err: err || null,
                url: args.url || null,
                httpVerb: args.httpVerb || null,
                date: DateUtils.toLocalIsoString(new Date().toString()),
                timezoneOffset: new Date().getTimezoneOffset() / 60,
                app: "Client-Admin",
                type: args.type || null,
                companyOid: this.authentication.isLoggedIn() ? this.auth.companyOid : null,
                userOid: this.authentication.isLoggedIn() ? this.auth.userOid : null
            }      

            console.log("logging error to node server");
            this.stack(ROUTES.logClientError, "POST", toData).subscribe((response) => {
                console.log("response: ", response);
                if (args.type === "API") return;
            }, (err) => {
                console.log("error sending client err to server");
            });
        }
    }
}

/////*****************************  ROUTES  ******************************///////

// all API routes
// api/node/* goes to node SERVER_URL
// api/cs/* goes to c# server

// api | cs?node | {controller} | {action}      .............some routes have  :params OR ?queries on server-side
export const ROUTES = {
    companyLogin: '/api/cs/auth/companyLogin',
    addAdmin: '/api/cs/owner/addAdmin',
    saveOwnerGeneralAdd: '/api/cs/owner/saveOwnerGeneralAdd',  
    saveOwnerGeneralEdit: '/api/cs/owner/saveOwnerGeneralEdit',
    saveLocation: '/api/cs/owner/saveLocation',
    saveProduct: '/api/cs/owner/saveProduct',
    saveReward: '/api/cs/owner/saveReward',
    getProcessingAndDiscountLkps: '/api/cs/owner/getProcessingAndDiscountLkps',
    getOwnerEditGeneral: '/api/cs/owner/getOwnerEditGeneral',
    getOwnerCategories: '/api/cs/owner/getOwnerCategories',
    getProductsNameAndOid: '/api/cs/owner/getProductsNameAndOid',
    getAllProductOptions: '/api/cs/owner/getAllProductOptions',
    getEditGeneral: '/api/cs/owner/getEditGeneral',
    editLocation: '/api/cs/owner/editLocation',
    getProductToEdit: '/api/cs/owner/getProductToEdit',
    editProduct: '/api/cs/owner/editProduct',
    getRewardsNameAndOid: '/api/cs/owner/getRewardsNameAndOid',
    getRewardToEdit: '/api/cs/owner/getRewardToEdit',
    editReward: '/api/cs/owner/editReward', 
    getLocations: '/api/cs/shared/getLocationsOwner',
    getRewards: '/api/cs/shared/getRewards',
    getCategories: '/api/cs/shared/getCategories',
    getProducts: '/api/cs/shared/getProducts',
    getProductDetails: '/api/cs/shared/getProductDetails',
    getRewardDetails: '/api/cs/owner/getRewardDetails',
    getTransactions: '/api/cs/owner/getTransactions',
    getTransactionDetails: '/api/cs/owner/getTransactionDetails',
    getRewardsUsedInTransaction: '/api/cs/owner/getRewardsUsedInTransaction',
    getEmailUnique: '/api/cs/auth/getEmailUnique',
    getNameUniqueOwner: '/api/cs/owner/getNameUniqueOwner',
    getExplanations: '/api/cs/appData/getExplanations',
    removeReward: '/api/cs/owner/removeReward',
    removeLocation: '/api/cs/owner/removeLocation',
    removeProduct: '/api/cs/owner/removeProduct',
    removeGeneral: '/api/cs/owner/removeGeneral',
    getLocationsNameAndOid: '/api/cs/shared/getLocationsNameAndOid',
    getRewardIndividualTypes: '/api/cs/owner/getRewardIndividualTypes',
    removeRewardIndividual: '/api/cs/owner/removeRewardIndividual',
    saveRewardIndividual: '/api/cs/owner/saveRewardIndividual',
    editRewardIndividual: '/api/cs/owner/editRewardIndividual',
    getRewardsIndividual: '/api/cs/owner/getRewardsIndividual',
    getRewardsIndividualNameAndOid: '/api/cs/owner/getRewardsIndividualNameAndOid',
    getEligibleRewardsProcessingTypeAutomaticForTransaction: '/api/cs/rewards/getEligibleRewardsProcessingTypeAutomaticForTransaction',
    processTransaction: '/api/cs/shared/processTransaction',
    processTransactionSimpleProcessing: '/api/cs/shared/processTransactionSimpleProcessing',
    getCompanyDetailsForTransaction: '/api/cs/shared/getCompanyDetailsForTransaction',
    getActiveOrders: '/api/cs/owner/getActiveOrders',
    clearActiveOrderForOrderAhead: '/api/cs/owner/clearActiveOrderForOrderAhead',
    processActiveOrderForOrderAheadRequest: '/api/cs/owner/processActiveOrderForOrderAheadRequest',
    loginSelectLocationAndReturnToken: '/api/cs/auth/loginSelectLocationAndReturnToken',
    processActiveOrderForOrderAhead: '/api/cs/owner/processActiveOrderForOrderAhead',
    setOrderToIsExpired: '/api/cs/owner/setOrderToIsExpired',
    getAppCustomizationsAndSettingsForOwnerPage: '/api/cs/owner/getAppCustomizationsAndSettingsForOwnerPage',
    saveCompanyDetails: '/api/cs/owner/saveCompanyDetails',
    getGenericDairyVarietySweetenerValues: '/api/cs/owner/getGenericDairyVarietySweetenerValues',
    saveDairyVarietySweetenerValues: '/api/cs/owner/saveDairyVarietySweetenerValues',  // takes array  does not take dairy anymore
    saveDairy: '/api/cs/owner/saveDairy',
    removeDairy: '/api/cs/owner/saveDairy',
    getDairy: '/api/cs/owner/getDairy',
    editDairy: '/api/cs/owner/editDairy',
    getDairyVarietySweetenerValues: '/api/cs/owner/getDairyVarietySweetenerValues',
    removeDairyVarietySweetener: '/api/cs/owner/removeDairyVarietySweetener',
    editDairyVarietySweetener: '/api/cs/owner/editDairyVarietySweetener',        // takes one
    getCompanyDetails: '/api/cs/shared/getCompanyDetails',
    getCompanyAppFeatures: '/api/cs/shared/getCompanyAppFeatures',
    getClientAdminAppStartupInfo: `/api/cs/shared/getClientAdminAppStartupInfo`,



    // TODO
    getUserDataForProcessOrder: '/api/cs/owner/getUserDataForProcessOrder',
    editPasswordCompany: '/api/cs/auth/editPasswordCompany',

    // NODE
    generateReceipt: '/api/node/emails/generateReceipt',
    downloadImg: `${global.SERVER_URL_NODE}/api/node/download/img`,
    getImgName: `/api/cs/shared/getImgName`,
    uploadCompanyAppImg: `${global.SERVER_URL_NODE}/api/node/upload/img/companyAppImg`,
    uploadImgNoCallback: `${global.SERVER_URL_NODE}/api/node/upload/img/noCallback`,
    uploadImgAndUnlink: `${global.SERVER_URL_NODE}/api/node/upload/img/uploadAndUnlink`,
    saveAppImg: '/api/node/owner/saveAppImg',


    // error logging
    logClientError: '/api/node/errorHandler/logClientError', // cs call built too
    getClientAdminVersionNumber: '/api/cs/appData/getClientAdminVersionNumber'
}