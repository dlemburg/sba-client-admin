import { Component } from '@angular/core';
import { Authentication } from '../../global/authentication.service';
import { AuthUserInfo } from '../../models/models';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: Component = 'ProcessOrderPage';
  tab2Root: Component = 'OrderAheadDashboardPage';
  tab3Root: Component = 'OwnerPage';
  isOwner: boolean = false;
  auth: AuthUserInfo;

  constructor(private authentication: Authentication) {
      this.auth = this.authentication.getCurrentUser();
      this.auth.role === "Owner" ? this.isOwner = true : this.isOwner = false;
  }
}
