import { Component } from '@angular/core';
import { API, ROUTES } from '../../global/api';
import { IRewardDetailsOwner, AuthUserInfo } from '../../models/models';
import { Authentication } from '../../global/authentication';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { BaseViewController } from '../base-view-controller/base-view-controller';
import { AppViewData } from '../../global/app-data';

@IonicPage()
@Component({
  selector: 'page-rewards-details',
  templateUrl: 'rewards-details.html'
})
export class RewardsDetailsPage extends BaseViewController {
  rewardImg: string;
  rewardImgSrc: string;
  rewardOid: number;
  DISCOUNT_TYPE: any = {
    MONEY: "Money",
    PERCENT: "Percent",
    NEW_PRICE: "New Price"
  }
  rewardDetails: IRewardDetailsOwner = {
      img: null,
      description: null,
      title: null,
      startDate: null,
      expiryDate: null,
      processingType: null,
      discountType: null,
      discountAmount: null,
      discountRule: null,
      dateRuleDays:  null,            //reward.dateRuleDays ? UtilityService.toArray(reward.dateRuleDays) : null,
      dateRuleTimeStart: null,
      dateRuleTimeEnd: null,
      productOid: null,
      name: null,
      oid: null
  };
  auth: AuthUserInfo;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public API: API, 
    public authentication: Authentication, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController) { 
    super(alertCtrl, toastCtrl, loadingCtrl);
  }

  ionViewDidLoad() {
    this.auth = this.authentication.getCurrentUser();
    this.rewardImg = this.navParams.data.rewardImg;
    this.rewardImgSrc = AppViewData.getDisplayImgSrc(this.navParams.data.rewardImg);
    this.rewardOid = this.navParams.data.rewardOid;
    this.presentLoading();

    this.API.stack(ROUTES.getRewardDetails + `/${this.auth.companyOid}/${this.rewardOid}`, "GET")
        .subscribe(
            (response) => {
              console.log('response.data: ' ,response.data);
              this.loading.dismiss();
              this.rewardDetails = response.data.rewardDetails;
            },this.errorHandler(this.ERROR_TYPES.API));
  }

  navRewardsBarcode() {
   // this.navCtrl.push(RewardsBarcodePage, {reward: this.reward});
  }
}
