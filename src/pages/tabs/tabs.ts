import { Component } from '@angular/core';
import { Authentication } from '../../global/authentication';
import { AuthUserInfo } from '../../models/models';
import { IonicPage } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  hasProcessOrderFeature: boolean = AppViewData.getFeatures().hasProcessOrder;
  auth: AuthUserInfo = this.authentication.getCurrentUser();
  tab1Root: string = 'ProcessOrderPage';
  tab2Root: string = 'SimpleProcessingPage';
  tab3Root: string = 'OrderAheadDashboardPage';
  tab4Root: string = 'OwnerPage';
  isOwner: boolean = this.auth && this.auth.role === "Owner" ? true : false;
  isLoggedIntoLocation: boolean = this.auth.locationOid ? true : false;

  constructor(private authentication: Authentication) {
  }

  ionViewDidLoad() {
     
  }
}
