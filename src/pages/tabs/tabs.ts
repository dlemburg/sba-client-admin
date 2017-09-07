import { Component } from '@angular/core';
import { Authentication } from '../../global/authentication';
import { AuthUserInfo } from '../../models/models';
import { IonicPage } from 'ionic-angular';
import { AppViewData } from '../../global/app-data';

@IonicPage()
@Component({
  selector: 'tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  auth: AuthUserInfo = this.authentication.getCurrentUser();
  tab1Root: string = 'ProcessOrderPage';
  tab2Root: string = 'SimpleProcessingPage';
  tab3Root: string = 'OrderAheadDashboardPage';
  tab4Root: string = 'OwnerPage';

  isOwner: boolean = this.auth && this.auth.role === "Owner" ? true : false;
  isLoggedIntoLocation: boolean = this.auth.locationOid ? true : false;
  hasProcessOrderFeature: boolean = true; // AppViewData.getFeatures().hasProcessOrder;


  constructor(private authentication: Authentication) {
  }

  ionViewDidLoad() {
     
  }
}
