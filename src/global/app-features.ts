import { Injectable } from '@angular/core';
import { ROUTES } from './api';

@Injectable()
export class AppFeatures {

constructor() { }

    private static _features = {
        hasProcessOrder: false
    }

    public static getFeatures() {
        return AppFeatures._features;
    }

    public static setFeatures(args) {
        AppFeatures._features = {
            hasProcessOrder: args.hasProcessOrder
        }
    }

}