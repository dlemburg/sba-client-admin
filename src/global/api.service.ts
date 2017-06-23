import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import * as global from './global';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Authentication } from '../global/authentication.service';
import { Ihttp } from '../models/models';

@Injectable()
export class API {
    /*  might need this for c# auth???
    contentHeaders.append('Accept', 'application/json');
    contentHeaders.append("Authorization", "Bearer " + token));
    contentHeaders.append('X-Requested-With',	'XMLHttpRequest');
            // this.headers.append( 'Content-Type', 'application/json' )

    */

    headers = new Headers({ 'Content-Type': 'application/json' }); 
    options = new RequestOptions({ headers: this.headers });
    
    constructor(private http: Http) {}

  
    public stack(route: string, verb: string, body: any = {}): Observable<any> {
      //  let {toData, method, route} = args;

        let url: string = route.indexOf('/api/node/') > -1 ? global.SERVER_URL_NODE : global.SERVER_URL_CSHARP;
            url += route;
        const httpVerb = verb.toLowerCase();
        const options = this.options;

        if (httpVerb === "post") {
            return this.http[httpVerb](url, body, options)
                    .map((response: Response) => response.json())
                    .catch(this.errorHandler);
        } else if (httpVerb === "get") {
            return this.http[httpVerb](url, options)
                    .map((response: Response) => response.json())
                    .catch(this.errorHandler);
        }
    }


    private errorHandler(err = 'ERROR! No stack trace given'): any {        
        console.error('SEND ERR, STACKTRACE TO LOGGER SERVICE HERE');
        throw err;
    }
}



/////*****************************  ROUTES  ******************************///////

// all API routes
// api/n/* goes to node SERVER_URL
// api/cs/* goes to c# server
const NODE = '/api/n';
const CS = '/api/cs';

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
    getLkpsIndividualRewardTypes: '/api/cs/owner/getLkpsIndividualRewardTypes',
    removeRewardIndividual: '/api/cs/owner/removeRewardIndividual',
    saveRewardIndividual: '/api/cs/owner/saveRewardIndividual',
    editRewardIndividual: '/api/cs/owner/editRewardIndividual',
    getRewardIndividualToEdit: '/api/cs/owner/getRewardIndividualToEdit',
    getRewardsIndividualNameAndOid: '/api/cs/owner/getRewardsIndividualNameAndOid',
    getEligibleRewardsProcessingTypeAutomaticForTransaction: '/api/cs/rewards/getEligibleRewardsProcessingTypeAutomaticForTransaction',
    processTransaction: '/api/cs/shared/processTransaction',
    getCompanyDetailsForTransaction: '/api/cs/shared/getCompanyDetailsForTransaction',
    getActiveOrders: '/api/cs/owner/getActiveOrders',
    clearActiveOrderForOrderAhead: '/api/cs/ownwer/clearActiveOrderForOrderAhead',
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


    getAppImg: '/api/cs/owner/getAppImg',


    // TODO
    getUserDataForProcessOrder: '/api/cs/owner/getUserDataForProcessOrder',
    editPasswordCompany: '/api/cs/auth/editPasswordCompany',

    // NODE
    generateReceipt: '/api/node/emails/generateReceipt',
    downloadImg: `${global.SERVER_URL_NODE}/api/node/download/img`,
    uploadImg: `${global.SERVER_URL_NODE}/api/node/upload/img`,
    saveAppImg: '/api/node/owner/saveAppImg',


}