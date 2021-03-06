import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { AuthUserInfo } from '../../models/models';
import { API, ROUTES } from '../../global/api';
import { Authentication } from '../../global/authentication';
import { BaseViewController } from '../base-view-controller/base-view-controller';


@IonicPage()
@Component({
  selector: 'page-explanations',
  templateUrl: 'explanations.html'
})
export class ExplanationsPage extends BaseViewController  {
  type: string;
  explanations: Array<string> = [];
  auth: AuthUserInfo;

constructor(
  public navCtrl: NavController, 
  public navParams: NavParams, 
  public API: API, 
  public authentication: Authentication, 
  public alertCtrl: AlertController, 
  public toastCtrl: ToastController, 
  public loadingCtrl: LoadingController, 
  public viewCtrl: ViewController) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
}

  ionViewDidLoad() {
    this.type = this.navParams.data.type.toLowerCase();
    this.auth = this.authentication.getCurrentUser();
    this.API.stack(ROUTES.getExplanations + `/${this.type.toLowerCase()}`, 'GET')
      .subscribe(
          (response) => {
            console.log('response.data: ', response.data);
            this.explanations = response.data.explanations;
          }, this.errorHandler(this.ERROR_TYPES.API));
  }

  dismissModal() {
    console.log("trying to dismiss");
    this.viewCtrl.dismiss();
  }

}
