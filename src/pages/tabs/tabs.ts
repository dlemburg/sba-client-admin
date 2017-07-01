import { Component } from '@angular/core';
import { Authentication } from '../../global/authentication';
import { AuthUserInfo } from '../../models/models';
import { IonicPage } from 'ionic-angular';
import { API, ROUTES } from '../../global/api';
import { AppFeatures } from '../../global/app-features';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1aRoot: Component = 'ProcessOrderPage';
  tab1bRoot = 'SimpleProcessingPage';
  tab2Root: Component = 'OrderAheadDashboardPage';
  tab3Root: Component = 'OwnerPage';
  isOwner: boolean = false;
  auth: AuthUserInfo;
  hasProcessOrderFeature: boolean = true;

  constructor(private authentication: Authentication) {
      this.auth = this.authentication.getCurrentUser();
      this.auth.role === "Owner" ? this.isOwner = true : this.isOwner = false;
      this.hasProcessOrderFeature = true // AppFeatures.getFeatures().hasProcessOrder;
  }

  ionViewDidLoad() {
     
  }
}
