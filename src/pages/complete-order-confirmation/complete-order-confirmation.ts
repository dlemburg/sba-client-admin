import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-complete-order-confirmation',
  templateUrl: 'complete-order-confirmation.html'
})
export class CompleteOrderConfirmationPage {
  doesWantReceipt: boolean = false;
  receiptType: string = null;
  receiptOptions: Array<any> = [];
  RECEIPT_TYPES = {
    EMAIL: "email",
    PRINTER: "printer",
    TEXT: "text message"
  }
  HAS_PRINTER: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {}

  ionViewDidLoad() {
    this.HAS_PRINTER = this.navParams.data.hasPrinter;

    // send this data through navParams
    this.receiptOptions = [
      { type: this.RECEIPT_TYPES.EMAIL, visible: true },
      { type: this.RECEIPT_TYPES.PRINTER, visible: this.HAS_PRINTER },
      { type: this.RECEIPT_TYPES.TEXT, visible: false },  // not available yet
    ]
  }

  onReceiptSelected(type) {
    this.doesWantReceipt = true;
    this.receiptType = type;
  }



  dismissWithData() {
    this.viewCtrl.dismiss({
      isConfirmed: true,
      doesWantReceipt: this.doesWantReceipt,
      receiptType: this.receiptType
    });
  } 

  dismissBack() {
    this.viewCtrl.dismiss({
      isConfirmed: false
    });
  }

}
