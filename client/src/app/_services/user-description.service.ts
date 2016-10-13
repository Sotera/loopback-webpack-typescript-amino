import {Injectable} from '@angular/core';
import {AppDescriptionService} from "./app-description.service";
import * as _ from 'lodash';

@Injectable()
export class UserDescriptionService {
  constructor(private appDescriptionService: AppDescriptionService) {
  }

  public get userInfo(): BaseUserInfo {
    var loginResponse: LoginResponse;
    try {
      loginResponse = JSON.parse(localStorage.getItem(this.appDescriptionService.userInfoKeyName));
      return {
        username: loginResponse.userInfo.username || '',
        fullname: loginResponse.userInfo.fullname || '',
        phone:  loginResponse.userInfo.phone || '',
        email: loginResponse.userInfo.email || ''
      }
    } catch (e) {
      return {
        username: '',
        phone: '',
        fullname: '',
        email: ''
      }
    }
  }

  get username(): string {
    return this.userInfo.fullname;
  }
}
