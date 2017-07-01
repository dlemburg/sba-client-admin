import { Injectable } from '@angular/core';

@Injectable()
export class Utils {
    constructor() { }


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
}