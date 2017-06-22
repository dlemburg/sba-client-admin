import { Injectable } from '@angular/core';
import { TOKEN_NAME } from './global';

import { AuthUserInfo } from '../models/models';

@Injectable()
export class Authentication {

    constructor() { }

    getCurrentUser(): AuthUserInfo {
        if (this.isLoggedIn()) {
            let token: any = this.getToken();
            let payload: any = token.split('.')[1];
            payload = window.atob(payload);
            payload = JSON.parse(payload);

            return {
                userOid: payload.userOid,
                companyOid: payload.companyOid || null,
                locationOid: payload.locationOid,
               // pushToken: payload.pushToken,
                role: payload.role,
                companyName: payload.companyName,
                email: payload.email,
                expiry: payload.expiry,
                acceptsPartialPayments: payload.acceptsPartialPayments
            };
        } else return null;
    }

    saveToken(token): void {
        window.localStorage[TOKEN_NAME] = token;
    };

    getToken(): any {
        return window.localStorage[TOKEN_NAME];
    };

    updateToken(token): void {
        window.localStorage.removeItem(TOKEN_NAME);
        window.localStorage[TOKEN_NAME] = token;
    };

    deleteToken(): void {
        window.localStorage.removeItem(TOKEN_NAME);
    };

    isLoggedIn() {
        let token: any = this.getToken();

        // if token is true, user is logged in -> then check date
        if (token) {
            // check expiry date
            return true;
        }
        else return false;
    };
}