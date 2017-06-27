import { Injectable } from '@angular/core';
import { Utils } from '../utils/utils';

@Injectable()
export class ReceiptTemplates {

constructor(public utils: Utils) { }

    public generateReceiptHTML(order, auth) {
        const date = new Date().toLocaleString();
        const subtotal = this.utils.roundAndAppendZero(order.transactionDetails.subtotal);
        const total = this.utils.roundAndAppendZero(order.transactionDetails.total);
        const taxes = this.utils.roundAndAppendZero(order.transactionDetails.taxes);
        const discounts = this.utils.roundAndAppendZero(order.transactionDetails.editAmount + order.transactionDetails.rewardsSavings);

        const purchaseItemsHTML =this.loopOverPurchaseItems(order.purchaseItems);
        console.log("auth: ", auth);

        return `<html>
                    <body> 
                        <div style="padding: 10px;">
                            <div style="text-align:center; margin:auto;"><h3>Receipt of Payment</h3></div>
                                <table style="width:100%;">
                                    <tbody>

                                    <!-- loop over purchase items -->` 
                                    + purchaseItemsHTML +
                                        
                                    `</tbody>
                                </table>
                            <table style="margin-top: 30px; width: 100%;">
                            <tbody>
                                <tr style="width:100%">
                                    <td style="width: 80%">
                                        <span>Subtotal:</span>
                                    </td>
                                    <td style="text-align:right; width: 20%;">$${subtotal}</td>
                                </tr>
                                <tr style="width:100%;">
                                    <td style="width:80%;">
                                        <span>Taxes:</span>
                                    </td>
                                    <td style="text-align:right; width: 20%;">$${taxes}</td>
                                </tr>
                                <tr style="width:100%;">
                                    <td style="width:80%;">
                                        <span>Discounts:</span>
                                    </td>
                                    <td style="text-align:right; width: 20%;">$${discounts}</td>
                                </tr>
                                <tr style="width:100%;">
                                    <td style="width:80%;">
                                        <span>Total:</span>
                                    </td>
                                    <td style="text-align:right; width: 20%;">$${total}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="text-align: center; color:  #4d4d4d;
                                    background-color: #387ef5;
                                    color: white;
                                    padding: 20px;
                                    margin-top: 50px !important;
                                    font-size: 10px !important;
                                    line-height: 18px;
                                    opacity: .9; ">
                            <div>Thanks for coming to ${auth.companyName}</div>
                            <div style="font-size: 10px;">Receipt generated on: ${ date }</div>
                        </div>
                    </div>
                </body>
            </html>`;
    }

    private loopOverPurchaseItems(purchaseItems) {
        let innerHTML = "";
        const getSize = (name) => {
            if (name) return `<span> ${name}</span>`;
            else return `<span></span>`
        }

        purchaseItems.forEach((x, index) => {
            let size = "";
            let displayPriceWithoutDiscounts = this.utils.roundAndAppendZero(x.displayPriceWithoutDiscounts);

            innerHTML += 
                `<tr style="width:100%">
                    <td style="width: 80%; 
                           font-weight: bold;  
                           border-bottom: 1px solid lightgray;
                           padding-top: 10px;
                           padding-bottom: 10px;">
                        <span>${x.quantity}</span>` 

                        + getSize(x.sizeAndOrPrice.name) + 

                        `<span> ${x.selectedProduct.name }</span>
                    </td>
                    <td style="width: 20%;
                           text-align: right; 
                           font-weight: bold;  
                           border-bottom: 1px solid lightgray;
                           padding-top: 10px;
                           padding-bottom: 10px;">${displayPriceWithoutDiscounts}</td>
                </tr>`;
        });

        return innerHTML;
    }

}