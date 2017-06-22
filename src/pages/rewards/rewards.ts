import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api.service';
import { IRewardForRewardsList, AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication.service';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController} from '../base-view-controller/base-view-controller';
import { Dates } from '../../global/dates.service';

@IonicPage()
@Component({
  selector: 'page-rewards',
  templateUrl: 'rewards.html'
})
export class RewardsPage extends BaseViewController {
  rewards: Array<IRewardForRewardsList> = [];
  auth: AuthUserInfo;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) { 
    super(navCtrl, navParams, API, authentication, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    const currentDate = Dates.toLocalIsoString(new Date().toString());
    
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();
    this.API.stack(ROUTES.getRewards + `/${this.auth.companyOid}/${currentDate}`, "GET")
        .subscribe(
            (response) => {
              this.rewards = response.data.rewards;
              this.dismissLoading();
              console.log('response.data: ' ,response.data);
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  navRewardDetails(reward): void {
    let rewardOid = reward.oid;
    let rewardImg = reward.img;
    this.navCtrl.push('RewardsDetailsPage', {rewardOid, rewardImg});
  }
}
