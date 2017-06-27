import { Injectable } from '@angular/core';
import { ROUTES } from './api';

@Injectable()
export class AppData {

constructor() { }

    private _storageDirectory = null;
    private toast = {
        defaultToastDuration: 5000,
        defaultToastPosition: "bottom",
        defaultErrorMessage: "Sorry, there was an unexpected error. We will work hard to get it fixed soon."
    }
    private img = {
        logoImgSrc: null,
        defaultImgSrc: "img/default.png",
    }
    private loading = {
        default: this.getLoadingInnerHtml(`Loading...`),
        saving: this.getLoadingInnerHtml(`Saving...`),
        processing: this.getLoadingInnerHtml(`Processing...`),
        complete: this.getLoadingInnerHtml(`Complete!`),
        saved: this.getLoadingInnerHtml(`Saved!`),
        removing: this.getLoadingInnerHtml(`Removing...`),
        removed: this.getLoadingInnerHtml(`Removed!`),
    }
    private rewards = {
        rewardTypeIndividualMessage: "Just for you!"
    }
    private popup = {
        defaultMissingInfoMessage: "Looks like you forgot to fill in everything!",
        defaultEditSuccessMessage: "Edit Successful",
        defaultSaveMessage: "Save Successful",
        defaultConfirmButtonText: "OK",
        defaultCancelButtonText: "Cancel",
        defaultSuccessTitle: "Success!",
        defaultErrorTitle: "Uh Oh!",
        defaultSuccessMessage: "Success!"
    }

   
    /* storage directory sets on app load */
    public setStorageDirectory(dir) {
        this._storageDirectory = dir;
    }
    public get getStorageDirectory(): any {
        return this._storageDirectory;
    }

    // if img == null, set imgSrc to the default img
    public getDisplayImgSrc(img: string = null): string {
        const defaultImgSrc = this.getImg().defaultImgSrc;
        const imgSrc = img ? `${ROUTES.downloadImg}?img=${img}` : defaultImgSrc;

        return imgSrc;
    }

    public setImgs(args) {
        this.img = {
            defaultImgSrc: args.defaultImgSrc,
            logoImgSrc: args.logoImgSrc
        };
    }
    
    public getPopup() {
        return this.popup;
    }

    public getToast() {
        return this.toast;
    }

    public getImg() {
        return this.img;
    }

    public getLoading() {
        return this.loading;
    }

    public getRewards() {
        return this.rewards;
    }

    private getLoadingInnerHtml(message) {
        return `<div class="custom-spinner-container">
                  <div class="custom-spinner-box">${message}</div>
                </div>`
    }

    public cleanup() {

    }

}