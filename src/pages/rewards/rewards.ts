import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { IRewardForRewardsList, AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController} from '../base-view-controller/base-view-controller';
import { DateUtils } from '../../utils/date-utils';
import { AppViewData } from '../../global/app-data';
import { CONST_APP_IMGS } from '../../global/global';

@IonicPage()
@Component({
  selector: 'page-rewards',
  templateUrl: 'rewards.html'
})
export class RewardsPage extends BaseViewController {
  rewards: Array<IRewardForRewardsList> = [];
  auth: AuthUserInfo;
  rewardImgSrc: string = null;
  logoImgSrc: string = AppViewData.getImg().logoImgSrc;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController) { 
    super(alertCtrl, toastCtrl, loadingCtrl, navCtrl);
  }

  ionViewDidLoad() {
    const currentDate = DateUtils.toLocalIsoString(new Date().toString());
    
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();
    this.API.stack(ROUTES.getRewards + `/${this.auth.companyOid}/${currentDate}`, "GET")
        .subscribe(
            (response) => {
              this.rewards = response.data.rewards;
              this.rewards.forEach((x) => {
                x.imgSrc = AppViewData.getDisplayImgSrc(x.img);
              });
              this.dismissLoading();
              console.log('response.data: ' ,response.data);
            }, this.errorHandler(this.ERROR_TYPES.API));

    const imgName = CONST_APP_IMGS[7];
    this.API.stack(ROUTES.getImgName + `/${this.auth.companyOid}/${imgName}`, "GET")
      .subscribe(
          (response) => {
            console.log('response: ', response);
            const img = response.data.img;
            this.rewardImgSrc = AppViewData.getDisplayImgSrc(img);
          }, (err) => {
            this.errorHandler(this.ERROR_TYPES.API, undefined, {shouldDismissLoading: false})(err);
            this.rewardImgSrc = AppViewData.getDisplayImgSrc(null);
          });
  }

  navRewardDetails(reward): void {
    let rewardOid = reward.oid;
    let rewardImg = reward.img;
    this.navCtrl.push('RewardsDetailsPage', {rewardOid, rewardImg});
  }
}
