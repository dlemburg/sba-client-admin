import { Injectable } from '@angular/core';

import { IPurchaseItem, IOrder, ICompanyDetailsForProcessOrder } from '../../models/models';

@Injectable()
export class ProcessOrderService {

constructor() { }

   
/*
    public calculateSubtotal(order: IOrder, COMPANY_DETAILS: ICompanyDetailsForProcessOrder): number {
        order.purchaseItems.forEach((x, index) => {
            order.transactionDetails.subtotal += (x.sizeAndOrPrice.price * x.quantity);
        });
        
        // null or a number (on server side, make sure to account for null)
        if (COMPANY_DETAILS.NUMBER_OF_ADDONS_UNTIL_CHARGED) {
            order.purchaseItems.forEach((x) => {
                if (x.addons.length && x.addons.length > COMPANY_DETAILS.NUMBER_OF_ADDONS_UNTIL_CHARGED) {
                    let numberOfChargedAddons = x.addons.length - COMPANY_DETAILS.NUMBER_OF_ADDONS_UNTIL_CHARGED;
                    order.transactionDetails.subtotal += (numberOfChargedAddons * COMPANY_DETAILS.ADDONS_PRICE_ABOVE_LIMIT);
                }
            });
        }

        return order.transactionDetails.subtotal;
    }
*/

    public calculateTotal() {

    }

    public calculateTaxes() {

    }

    public calculateTaxesAndTotal() {

    }
}