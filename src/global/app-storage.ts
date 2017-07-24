import { Injectable } from '@angular/core';

@Injectable()


// this is a hack- had to save it here when navigating to new page with google maps
export class AppStorage {

constructor() { }
    private static _latAndLong: {coordsLat: number, coordsLong: number} = {coordsLat: null, coordsLong: null};


    public static setLatAndLong(latAndLong) {
        AppStorage._latAndLong = Object.assign({}, latAndLong);
    }

    public static getLatAndLong() {
        return AppStorage._latAndLong;
    }

}