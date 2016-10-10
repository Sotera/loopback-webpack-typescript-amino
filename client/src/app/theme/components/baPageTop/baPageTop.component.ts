import {Component, ViewEncapsulation} from '@angular/core';

import {GlobalState} from '../../../global.state';
import {AuthenticationService} from "../../../_services/authentication.service";

@Component({
  selector: 'ba-page-top',
  styles: [require('./baPageTop.scss')],
  template: require('./baPageTop.html'),
  encapsulation: ViewEncapsulation.None
})
export class BaPageTop {

  public isScrolled: boolean = false;
  public isMenuCollapsed: boolean = false;

  constructor(private _state: GlobalState,
              private authenticationService: AuthenticationService,) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  public logout() {
    this.authenticationService.logout();
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
  }

  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }
}
