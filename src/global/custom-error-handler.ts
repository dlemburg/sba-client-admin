import { ErrorHandler, Injectable } from '@angular/core';
import { DateUtils } from '../utils/date-utils';
import { API, ROUTES } from './api';
import { Authentication } from './authentication';
import { AuthUserInfo } from '../models/models';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
    auth: AuthUserInfo;
    constructor(public API: API, public authentication: Authentication ) {
        this.auth = this.authentication.getCurrentUser();
    }

    handleError(err: any): void {  
        const toData = {
            date: DateUtils.toLocalIsoString(new Date().toString()),
            app: "Client Admin",
            companyOid: this.authentication.isLoggedIn() ? this.auth.companyOid : "Not logged in",
            userOid: this.authentication.isLoggedIn() ? this.auth.userOid : "Not logged in",
            err: err
        }
        

        // SEND API HERE!
        this.API.stack(ROUTES.logError, "POST", toData)
            .subscribe(
                (response) => {
                    console.log('response.data: ', response.data);
                
                }, (err) => {
                    console.log("%c error sending error log to server!", 'color: red;');
                });

        console.log("%c error generated from CustomErrorHandler: " + err, 'color: red;');
       // console.log("%c toData error data going to server: " + toData, "color: green;")
    }
}