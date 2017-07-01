import { Injectable } from '@angular/core';
import { ROUTES } from './api';

@Injectable()
export class AppViewData {

constructor() { }

    private static _storageDirectory = null;
    private static toast = {
        defaultToastDuration: 3000,
        defaultToastPosition: "bottom",
        defaultErrorMessage: "Sorry, there was an unexpected error. We will work hard to get it fixed soon.",
        imgUploadErrorMessageFirstAttempt: "Sorry, there was an error uploading your image. Try submitting again.",
        imgUploadErrorMessageSecondAttempt: ""
    }
    private static img = {
        logoImgSrc: null,
        defaultImgSrc: "img/default.png",
    }
    private static loading = {
        default: AppViewData.getLoadingInnerHtml(`Loading...`),
        saving: AppViewData.getLoadingInnerHtml(`Saving...`),
        processing: AppViewData.getLoadingInnerHtml(`Processing...`),
        complete: AppViewData.getLoadingInnerHtml(`Complete!`),
        saved: AppViewData.getLoadingInnerHtml(`Saved!`),
        removing: AppViewData.getLoadingInnerHtml(`Removing...`),
        removed: AppViewData.getLoadingInnerHtml(`Removed!`),
        savingImg: AppViewData.getLoadingInnerHtml(`Saving image first...`)
    }
    private static rewards = {
        rewardTypeIndividualMessage: "Just for you!"
    }
    private static popup = {
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
    public static setStorageDirectory(dir) {
        AppViewData._storageDirectory = dir;
    }
    public static get getStorageDirectory(): any {
        return AppViewData._storageDirectory;
    }

    // if img == null, set imgSrc to the default img
    public static getDisplayImgSrc(img: string = null): string {
        const defaultImgSrc = AppViewData.getImg().defaultImgSrc;
        const imgSrc = img ? `${ROUTES.downloadImg}?img=${img}` : defaultImgSrc;

        return imgSrc;
    }

    public static setImgs(args) {
        AppViewData.img = {
            defaultImgSrc: args.defaultImgSrc,
            logoImgSrc: args.logoImgSrc
        };
    }
    
    public static getPopup() {
        return AppViewData.popup;
    }

    public static getToast() {
        return AppViewData.toast;
    }

    public static getImg() {
        return AppViewData.img;
    }

    public static getLoading() {
        return AppViewData.loading;
    }

    public static getRewards() {
        return AppViewData.rewards;
    }

    private static getLoadingInnerHtml(message) {
        return `<div class="custom-spinner-container">
                  <div class="custom-spinner-box">${message}</div>
                </div>`
    }

    public static cleanup() {

    }

}