import { Injectable } from '@angular/core';

@Injectable()
export class ProcessOrderService {

    constructor() { }

   // public categoriesCache = {};
    public _cachedProductDetails = {};
    private _categories = [];
    private _products = [];

    public getProducts(categoryOid: number) {
       return this._products.filter((x) => x.categoryOid === categoryOid);
    }

    public setProducts(products) {
        this._products = products;

        return this._products;
    }

    public getCategories() {
        return this._categories;
    }

    public setCategories(categories) {
        this._categories = categories;

        return this._categories;
    }

    public getCachedProductDetails(productOid) {
        return this._cachedProductDetails[productOid];
    }

    public setCachedProductDetails(productOid, productDetails) {
        this._cachedProductDetails[productOid] = Object.assign({}, productDetails);

        return this._cachedProductDetails[productOid];
    }

    public isProductsCacheAvailable(): boolean {
        return Object.keys(this._cachedProductDetails).length > 0;
    }

  

}