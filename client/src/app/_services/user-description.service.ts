import {Injectable} from '@angular/core';
import {AppDescriptionService} from "./app-description.service";

@Injectable()
export class UserDescriptionService {
  constructor(private appDescriptionService: AppDescriptionService) {
  }

  private get userInfo(): UserInfo {
    try {
      var loginResponse = JSON.parse(localStorage.getItem(this.appDescriptionService.userInfoKeyName));
      return loginResponse.userInfo;
    } catch (e) {
      return {
        username: 'unknown',
        fullname: 'unknown',
        email: 'unknown'
      };
    }
  }

  get username(): string {
    return this.userInfo.fullname;
  }
}
