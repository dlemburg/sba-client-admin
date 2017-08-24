import { Injectable } from '@angular/core';
import { ICurrentDateInfo } from '../models/models';

@Injectable()
export class DateUtils {

constructor() { }

    public static getDays() {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    }

    public static getBeginningDateToday() {
        return new Date(new Date().setHours(0, 0, 1, 0));
    }

    // i.e.:  "09:00am" ->  9
    public static convertTimeStringToHours(timeString: string): number {
        let time = this.sliceZero(timeString);
        let hours = this.getHours(time);

        return hours;
    }

    // i.e.: "18:00pm" -> "6:00pm""
    public static converMilitaryTimeStringToNormalTimeString(timeString: string): string {

        let normalHours = this.to12Hour(this.getHours(timeString));
        let minutes = this.getMinutes(timeString);
        let amOrPm = timeString.slice(-2);


        return `${normalHours}:${minutes}${amOrPm}`

    }

    // comes in as military hours, keeps as military hours
    public static convertTimeStringToIsoString(timeString: string): string {

        debugger;

        let time = this.sliceZero(timeString);
        let hours = this.getHours(time);
        let minutes = this.getMinutes(time);
        let dateStr = this.toLocalIsoString(new Date(new Date().setHours(hours, minutes, 0)).toString());

        return dateStr;
    }

    // i.e.: ISOString ->  "09:30am"  
    // keeps in military hours
    // also takes "closed" or timeString i.e. "09:00am" and returns it
    public static convertIsoStringToHoursAndMinutesString(isoString: string): string {

        // this accounts for closed days. should not be apart of re-usable utility fn
        if (isoString === "closed" || isoString === "Closed" || isoString.length < 8) return isoString;

        // "2017-08-16T17:00:00Z"
        const hours = this.getHoursFromIsoStr(isoString);
        const mins = this.getMinsFromIsoStr(isoString);
        let amOrPm = "";
/*
        const date = new Date(isoString);
        const minutes = this.prependZero(date.getMinutes());
        const militaryHours = date.getHours();
*/

        if (hours >= 12) amOrPm = "pm";
        else if (hours === 0 || hours < 12) amOrPm = "am";

        const minutesAndHoursStr = `${hours}:${mins}${amOrPm}`;
        console.log("location minutesAndHoursStr: ", minutesAndHoursStr);

        return minutesAndHoursStr;
    }

    // gets all relevant date information about client to send to server
    public static getCurrentDateInfo(): ICurrentDateInfo {
        let date = new Date();

        let hours = date.getHours();
        let mins = date.getMinutes();
        let day = date.getDay();

        return {date, hours, mins, day};
    }

    // accounts for timezone offset and converts to ISOString format
    public static toLocalIsoString(dateStr: string) {
        let date = new Date(dateStr);
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        let ISOtime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0,-1); // gets rid of trailing Z

        return ISOtime;
    }

    // "2017-08-16T17:00:00Z" -> 17
    public static getHoursFromIsoStr(isoString: string) {
        const arr =  isoString.split(":");
        const hours = +arr[0].slice(arr[0].length - 2);

        return hours;
    }

    // "2017-08-16T17:30:00Z" -> 30
    public static getMinsFromIsoStr(isoString: string) {
        const arr = isoString.split(":");
        const mins = arr[1];

        return mins;
    }

    // accounts for browser offset
    public static toLocalDate(dateStr: string) {
        const date = new Date(dateStr);
        const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        const localDate = (new Date(date.getTime() - tzoffset))

        return localDate;
    }

    // "0,1,2,3,4,5,6" -> "Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"
    public static numberStringToDayString(str) {
        if (!str) return "";

        let days = DateUtils.getDays();
        let strArr = str.split(",");
        const dayString = strArr.map((x) => days[x]).join(", ");

        return dayString;
    }

        // "17" -> "5:00pm";
    public static to12HourTimeString(timeStr): string {
        if (timeStr === null) return null;
        
        const amOrPm = +timeStr < 11 ? "am" : "pm";
        const time = DateUtils.to12Hour(+timeStr);
        
        return `${time}:00${amOrPm}`;
    }


    // prepends ISOString type data at beginning
    public static patchStartTime(time: string): string {
        return time + "T00:00:00.000Z";
    }

    // appends ISOString type data to end
    public static patchEndTime(time: string): string {
        return time + "T23:59:59.000Z";
    }

    // gets rid of prefix zero   i.e. "09:00" ->  "9:00"
    public static sliceZero(time: string): string {
        if (time.indexOf("0") === 0) {
            time = time.slice(1, time.length);
        }

        return time;
    }

    public static prependZero(time: number): string {
        if (time < 10) return "0" + time;
        else return time.toString();
    }

    // converts military to 12 hour
    public static to12Hour(time: number): number {
        if (time > 12) time = time - 12;
        if (time === 0) time = 12;

        return time;
    }

    // converts timeString   "09:00" or "09" ->  9
    public static getHours(time: string): number {
        return time.indexOf(":") > -1 ? +time.split(":")[0] : +time;
    }

    // gets minutes from timeString   i.e.  "09:30" or "30"  ->  30
    public static getMinutes(time: string): number {
        return time.indexOf(":") > -1 ? +time.split(":")[1] : +time;
    }

    // converts normal time to military time
    public static to24Hour(hours:string, isPm:boolean): number {
        let time = +hours;
        if (!isPm && time === 12) return 0;  // midnight
        else if (isPm && time !== 12) return time + 12;
        else return time;
    }
}