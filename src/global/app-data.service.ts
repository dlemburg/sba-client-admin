import { Injectable } from '@angular/core';
import * as global from './global';

@Injectable()
export class AppDataService {

constructor() { }
    private static _storageDirectory = null;

    /* Company  oid*/
    public static get getCompanyOid(): number {
        return global.companyOid;
    }

    /* storage directory sets on app load */
    public static setStorageDirectory(dir) {
        AppDataService._storageDirectory = dir;
    }
    public static get getStorageDirectory(): any {
        return AppDataService._storageDirectory;
    }

    /* Popup */
    public static get defaultMissingInfoMessage(): string {
        return "Looks like you forgot to fill in everything!";
    }

    public static get defaultEditSuccessMessage(): string {
        return "Edit successful!";
    }

    public static get defaultSaveMessage(): string {
        return "Save successful!";
    }

    public static get defaultConfirmButtonText(): string {
        return "OK";
    }

    public static get defaultCancelButtonText(): string {
        return "Cancel";
    }

    public static get defaultSuccessTitle(): string {
        return "Success!";
    }

    public static get defaultErrorTitle(): string {
        return "Uh Oh!";
    }

    public static get defaultSuccessMessage(): string {
        return "Success!";
    }



    /* Toast */
    public static get defaultToastPosition(): string {
        return "bottom";
    }

    public static get defaultToastDuration(): number {
        return 5000;
    }

    public static get defaultErrorMessage(): string {
        return "Sorry, there was an unexpected error. We will work hard to get it fixed soon.";
    }


    /* IMG */
    public static get getGenericImg(): string {
        return "img/family.png";
    }

    public static get getDefaultImg(): string {
        return "img/family.png";
    }

    public static get loginBackgroundImg(): string {
        return "img/family.png";
    }



    /* Loading */
    private static getLoadingInnerHtml(message) {
        return `<div class="custom-spinner-container">
                  <div class="custom-spinner-box">${message}</div>
                </div>`
    }

    public static loading = {
        default: AppDataService.getLoadingInnerHtml(`Loading...`),
        saving: AppDataService.getLoadingInnerHtml(`Saving...`),
        processing: AppDataService.getLoadingInnerHtml(`Processing...`),
        complete: AppDataService.getLoadingInnerHtml(`Complete!`),
        saved: AppDataService.getLoadingInnerHtml(`Saved!`),
        removing: AppDataService.getLoadingInnerHtml(`Removing...`),
        removed: AppDataService.getLoadingInnerHtml(`Removed!`)
    }


    public static checkAll(): Array<string> {
         return ['flavors', 'addons', 'variety', 'dairy', 'sweetener'];
    }


    public static cleanup() {
        //AppDataService.setStorageDirectory(null);
    }
}