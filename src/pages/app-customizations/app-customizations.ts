import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { API, ROUTES } from '../../global/api';
import { Validation } from '../../utils/validation-utils';
import { Authentication } from '../../global/authentication';
import { AppData } from '../../global/app-data';
import { AuthUserInfo } from '../../models/models';
import { BaseViewController } from '../base-view-controller/base-view-controller';


@Component({
  selector: 'page-customizations',
  templateUrl: 'app-customizations.html'
})

// TODO: explanations
export class AppCustomizationsPage extends BaseViewController {
  type: string;
  myForm: FormGroup;
  isSubmitted: boolean = false;
  didFormChange: boolean = false;
  allFieldsEmptyOnEnter: boolean;
  auth: AuthUserInfo;
  customizations: Array<any> = [];

 constructor(public navCtrl: NavController, public navParams: NavParams, public validation: Validation, public appData: AppData, public API: API, public authentication: Authentication, public modalCtrl: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private formBuilder: FormBuilder) { 
    super(appData, modalCtrl, alertCtrl, toastCtrl, loadingCtrl);
   
    this.myForm = this.formBuilder.group({
      hasDairy: [false],
      hasSweetener: [false],
      hasVariety: [false],
      hasFlavors: [false],
      hasAddons: [false],
      doesChargeForDairy: [false],
      doesChargeForAddons: [false],
      hasRewardIndividualBirthday: [false],
      hasRewardIndividualFirstMobileCardUpload: [false],
      //hasRewardIndividualPointsThreshold: [false],
      defaultProductHealthWarning: [null],
     // defaultRewardsExclusionsMessage: [null],
     // defaultOrderAheadExclusionsMessage: [null],
      customCompanyEmailReloadMessage: [" "],
      customCompanyEmailReceiptMessage: [" "],
      customCompanyEmailFooterMessage: [" "],
      hasSocialMediaRewards: [false],
      socialMediaDiscountAmountPercent: [0, this.validation.test("isMoney")],
      socialMediaMessage: [null],
      hasFacebook: [false],
      hasTwitter: [false],
      hasInstagram: [false],
      pointsThreshold: [0, this.validation.test("isNumbersOnly")],
      pointsPerFiftyCents: [0, this.validation.test("isNumbersOnly")],
      hasPrinter: [false],
      acceptsPartialPayments: [false]
    });
  }

/*

upload(http:Http, file:Blob, name:string, url:string){
    let formData: FormData = new FormData();
    formData.append("somevariable", this.myextravar);
    formData.append("photo", file, name);
    this.subscription = http.post(url, formData, {withCredentials: true}).map(o => o.json()).subscribe(o => {
        console.log('uploaded', o); 
    }, (err) => {
        console.error('upload err', err);
    })
}


*/
  ionViewDidLoad() {
    this.myForm.valueChanges.subscribe(data => this.onFormChange(data));    // all
    this.auth = this.authentication.getCurrentUser();
    this.presentLoading();

    this.API.stack(ROUTES.getCompanyDetails, "POST", {companyOid: this.auth.companyOid})
        .subscribe(
            (response) => {
              this.dismissLoading();

              this.myForm.patchValue({
                hasDairy: response.data.companyDetails.hasDairy,
                hasSweetener: response.data.companyDetails.hasSweetener,
                hasVariety: response.data.companyDetails.hasVariety,
                hasFlavors: response.data.companyDetails.hasFlavors,
                hasAddons: response.data.companyDetails.hasAddons,
                doesChargeForDairy: response.data.companyDetails.doesChargeForDairy,
                doesChargeForAddons: response.data.companyDetails.doesChargeForAddons,
                hasRewardIndividualBirthday: response.data.companyDetails.hasRewardIndividualBirthday,
                hasRewardIndividualFirstMobileCardUpload: response.data.companyDetails.hasRewardIndividualFirstMobileCardUpload,
               // hasRewardIndividualPointsThreshold: response.data.companyDetails.hasRewardIndividualPointsThreshold,
                defaultProductHealthWarning: response.data.companyDetails.defaultProductHealthWarning,
                defaultRewardsExclusionsMessage: response.data.companyDetails.defaultRewardsExclusionsMessage,
                defaultOrderAheadExclusionsMessage: response.data.companyDetails.defaultOrderAheadExclusionsMessage,
                customCompanyEmailReloadMessage: response.data.companyDetails.customCompanyEmailReloadMessage,
                customCompanyEmailReceiptMessage: response.data.companyDetails.customCompanyEmailReceiptMessage,
                hasSocialMediaRewards: response.data.companyDetails.hasSocialMediaRewards,
                socialMediaDiscountAmountPercent: response.data.companyDetails.socialMediaDiscountAmountPercent,
                socialMediaMessage: response.data.companyDetails.socialMediaMessage,
                hasFacebook: response.data.companyDetails.hasFacebook,
                hasTwitter: response.data.companyDetails.hasTwitter,
                hasInstagram: response.data.companyDetails.hasInstagram,
                pointsThreshold: response.data.companyDetails.pointsThreshold,
                pointsPerFiftyCents: response.data.companyDetails.pointsPerFiftyCents,
                hasPrinter: response.data.companyDetails.hasPrinter,
                acceptsPartialPayments: response.data.companyDetails.acceptsPartialPayments
              });
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView)
            });
  }

  onFormChange(data) {
    this.didFormChange = true;
  }

  navExplanations() {
    this.presentModal('ExplanationsPage', {type: "app_customizations"});
  }



  submit(myForm: FormControl, isValid: boolean) {
    this.isSubmitted = true;
    debugger;
    if (this.didFormChange) {
      this.presentLoading();
      let toData = { toData: myForm, companyOid: this.auth.companyOid }
      this.API.stack(ROUTES.saveCompanyDetails, "POST", toData)
        .subscribe(
            (response) => {
              this.dismissLoading(this.appData.getLoading().saved);
              console.log("response: ", response);
            }, (err) => {
              const shouldPopView = false;
              this.errorHandler.call(this, err, shouldPopView);
            });
    }
  }
}
