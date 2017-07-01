import { Injectable } from '@angular/core';

@Injectable()
export class AppStorage {

constructor() { }
    private static _latAndLong: {coordsLat: number, coordsLong: number} = null;


    public static setLatAndLong(latAndLong) {
        AppStorage._latAndLong = latAndLong;
    }

    public static getLatAndLong() {
        return AppStorage._latAndLong;
    }

}