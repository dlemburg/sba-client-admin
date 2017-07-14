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
  hasProcessOrderFeature: boolean = AppFeatures.getFeatures().hasProcessOrder;
  auth: AuthUserInfo = this.authentication.getCurrentUser();
  tab1Root: Component = 'ProcessOrderPage';
  tab2Root = 'SimpleProcessingPage';
  tab3Root: Component = 'OrderAheadDashboardPage';
  tab4Root: Component = 'OwnerPage';
  isOwner: boolean = this.auth.role === "Owner" ? true : false;

  constructor(private authentication: Authentication) {
  }

  ionViewDidLoad() {
     
  }
}
