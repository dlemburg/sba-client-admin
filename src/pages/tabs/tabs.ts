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
  tab1bRoot = 'ScanBarcodesPage';
  tab2Root: Component = 'OrderAheadDashboardPage';
  tab3Root: Component = 'OwnerPage';
  isOwner: boolean = false;
  auth: AuthUserInfo;
  hasProcessOrderFeature: boolean = false;

  constructor(private authentication: Authentication, public appFeatures: AppFeatures) {
      this.auth = this.authentication.getCurrentUser();
      this.auth.role === "Owner" ? this.isOwner = true : this.isOwner = false;
      this.hasProcessOrderFeature = this.appFeatures.getFeatures().hasProcessOrder;
  }

  ionViewDidLoad() {
     
  }
}
