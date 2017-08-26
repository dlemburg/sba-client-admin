import { Injectable } from '@angular/core';
import { CONST_APP_IMGS } from '../global/global';
import { DateUtils } from './date-utils';
import { AppViewData } from '../global/app-data';

@Injectable()
export class Utils {
    constructor() { }

    public static getNumbersMultipleSelectionList(len: number = 25): Array<{number?: number, isSelected?: boolean}> {
        let arr = [];
        for (let i = 1; i < len + 1; i++) {
            arr.push({number: i, isSelected: false});
        }
        return arr;
    }

    public static getDays() {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }

    public static getStates(): Array<string> {
        return ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota',
        'Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
    }

    public static getStatesAbbreviated() {
        return ['AL', 'AK', 'American Samoa', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'Washington DC', 'Federated States of Micronesia', 'FL', 'GA', 'Guam', 'HI', 'ID', 'ILL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 
        'Marshall Islands', 'MD', 'MA', 'MI', 'MN', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'Northern Mariana Islands', 'OH', 'OK', 'OR', 'Palau', 'PA', 'Puerto Rico', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VE', 'Virgin Islands', 'WA', 'WV', 'WI', 'WY']
    }

    public static generateRandomString = (length = 8) => {
        let charset = "abcdefghijklmnpqrstuvwxyz",
            len = charset.length,
            retVal = "";
        
        for (let i = 0; i < length; i++) {
            retVal += charset.charAt(Math.floor(Math.random() * len));
        }

        return retVal;
    };

     public static generateRandomNumber = (length = 4): number => {
        let charset = "123456789",
            len = charset.length,
            retVal = "";
        
        for (let i = 0; i < length; i++) {
            retVal += charset.charAt(Math.floor(Math.random() * len));
        }

        return +retVal;
    };

    public static generateImgName = (data: {appImgIndex: number, name: string, companyOid: number}): string => {
        let isoDate = DateUtils.toLocalIsoString(new Date().toString());
        isoDate = isoDate.slice(0, isoDate.indexOf("T")).replace(/:/g, "-");

        // not using name anymore
        return `${CONST_APP_IMGS[data.appImgIndex]}$${Utils.generateRandomString(4)}$${data.companyOid}$${Utils.generateRandomString(4)}$${isoDate}.jpg`.replace(/\s+/g, '');

        // i.e.:  categoriesImg$muffins$12$ai39vl5z$2017-07-14T15-28-12
    }

     public static getNumbersList(len: number = 25): Array<number> {
        let arr = [];
        for (let i = 1; i < len + 1; i++) {
            arr.push(i);
        }
        return arr;
    }


    public static toArray(str: string): Array<any> {
        let arr = str.split(",");

        return arr;
    }

    public static arrayToString(arr: Array<any>): string {
        let str = arr.join(",");

        return str;
    }

    public static round(num: number): number {
        return +(Math.round(num * Math.pow(10,2)) / Math.pow(10,2)).toFixed(2);
    }

    // i.e.: 4.5   length (3 - 1 === 2), decimalIndex 1   becomes 4.50
    public static roundAndAppendZero(num: number): string {
        let retNumber = (Math.round(num * Math.pow(10,2)) / Math.pow(10,2)).toFixed(2);

        let decimalIndex = retNumber.toString().indexOf("."); 

        if ( ( (retNumber.toString().length -1) - decimalIndex) === 1) retNumber += "0";

        return retNumber;
    }

    public static getImgs(arr) {
        if (arr.length) {
            arr.forEach((x) => {
                x.imgSrc = AppViewData.getDisplayImgSrc(x.img);
            });
            return arr;
        } else return [];
    }
}