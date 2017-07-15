import { Injectable } from '@angular/core';

@Injectable()
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