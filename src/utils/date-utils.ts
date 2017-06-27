import { Injectable } from '@angular/core';
import { ICurrentDateInfo } from '../models/models';

@Injectable()
export class DateUtils {

constructor() { }

    public getBeginningDateToday() {
        return new Date().setHours(0, 0, 1, 0);
    }

    // i.e.:  "09:00am" ->  9
    public convertTimeStringToHours(timeString: string): number {
        let time = this.sliceZero(timeString);
        let hours = this.getHours(time);

        return hours;
    }

    // i.e.: "18:00pm" -> "6:00pm""
    public converMilitaryTimeStringToNormalTimeString(timeString: string): string {

        let normalHours = this.to12Hour(this.getHours(timeString));
        let minutes = this.getMinutes(timeString);
        let amOrPm = timeString.slice(-2);


        return `${normalHours}:${minutes}${amOrPm}`

    }

    // comes in as military hours, keeps as military hours
    public convertTimeStringToIsoString(timeString: string): string {
        let time = this.sliceZero(timeString);
        let hours = this.getHours(time);
        let minutes = this.getMinutes(time);
        let dateStr = this.toLocalIsoString(new Date(new Date().setHours(hours, minutes, 0)).toString());

        return dateStr;
    }

    // i.e.: ISOString ->  "09:30am"  
    // keeps in military hours
    public convertIsoStringToHoursAndMinutesString(IsoString: string): string {

        // this accounts for closed days. should not be apart of re-usable utility fn
        if (IsoString === "closed" || IsoString === "Closed") return IsoString;

        const date = new Date(IsoString);
        const minutes = this.prependZero(date.getMinutes());
        const militaryHours = date.getHours();
        let amOrPm = "";

        if (militaryHours >= 12) amOrPm = "pm";
        else if (militaryHours === 0 || militaryHours < 12) amOrPm = "am";


        return `${militaryHours}:${minutes}${amOrPm}`
    }

    // gets all relevant date information about client to send to server
    public getCurrentDateInfo(): ICurrentDateInfo {
        let date = new Date();

        let hours = date.getHours();
        let mins = date.getMinutes();
        let day = date.getDay();

        return {date, hours, mins, day};
    }

    // accounts for timezone offset and converts to ISOString format
    public toLocalIsoString(dateStr: string) {
        let date = new Date(dateStr);
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        let ISOtime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0,-1); // gets rid of trailing Z

        return ISOtime;
    }

    // prepends ISOString type data at beginning
    public patchStartTime(time: string): string {
        return time + "T00:00:00.000Z";
    }

    // appends ISOString type data to end
    public patchEndTime(time: string): string {
        return time + "T23:59:59.000Z";
    }

    // gets rid of prefix zero   i.e. "09:00" ->  "9:00"
    public sliceZero(time: string): string {
        if (time.indexOf("0") === 0) {
            time = time.slice(1, time.length);
        }

        return time;
    }

    public prependZero(time: number): string {

        if (time < 10) return "0" + time;
        else return time.toString();
    }

    // converts military to 12 hour
    public to12Hour(time: number): number {
        if (time > 12) time = time - 12;
        if (time === 0) time = 12;

        return time;
    }

    // converts timeString   "09:00" ->  9
    public getHours(time:string): number {
        let index = time.indexOf(":");
        let isPm = time.indexOf("a") < 0 ? true : false;

        //debugger;
        //let hours = Dates.to24Hour(time.slice(0, index), isPm);
        let hours = time.slice(0, index);
    
        return +hours;
    }

    // gets minutes from timeString   i.e.  "09:30"  ->  30
    public getMinutes(time:string): number {
        let start = time.indexOf(":") + 1;
        //let amOrPm = time.indexOf("m");
        let minutes = time.slice(start, -2);

        return +minutes;
    }

    // converts normal time to military time
    public to24Hour(hours:string, isPm:boolean): number {
        let time = +hours;
        if (!isPm && time === 12) return 0;  // midnight
        else if (isPm && time !== 12) return time + 12;
        else return time;
    }


}