import { Injectable } from '@angular/core';
import { ROUTES } from './api';

@Injectable()
export class AppFeatures {

constructor() { }

    private _features = {
        hasProcessOrder: false
    }

    public getFeatures() {
        return this._features;
    }

    public setFeatures(args) {
        this._features = {
            hasProcessOrder: args.hasProcessOrder
        }
    }

}