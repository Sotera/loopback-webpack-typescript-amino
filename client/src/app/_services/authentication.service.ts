import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {contentHeaders} from '../_guards/index';
import 'rxjs/add/operator/map'
import {Observable} from "rxjs";
import {AppDescriptionService} from "./app-description.service";
import {Router} from "@angular/router";
import {UserInfoImpl, UserRegistrationInfo} from "../_models/authentication.models";

@Injectable()
export class AuthenticationService {
  constructor(private http: Http,
              private appDescriptionService: AppDescriptionService) {
  }

  public get userInfo(): UserInfo {
    var userInfoJson = localStorage.getItem(this.appDescriptionService.userInfoKeyName);
    return new UserInfoImpl(userInfoJson);
  }

  updateUserInfo(userInfo: UserInfo) {
    return this.httpPost(userInfo, '/auth/update-user-info');
  }

  register(userInfo: UserRegistrationInfo) {
    return this.httpPost(userInfo, '/auth/register');
  }

  login(loginFormSubmission: LoginFormSubmission) {
    return this.httpPost(loginFormSubmission, '/auth/login');
  }

  set updateUserInfoResponse(updateUserInfoResponse: UpdateUserInfoResponse) {
    var ads = this.appDescriptionService;
    localStorage.setItem(ads.userInfoKeyName, JSON.stringify(updateUserInfoResponse.userInfo));
  }

  set loginResponse(loginResponse: LoginResponse) {
    var ads = this.appDescriptionService;
    localStorage.setItem(ads.userInfoKeyName, JSON.stringify(loginResponse.userInfo));
    localStorage.setItem(ads.jwtTokenKeyName, loginResponse.jwtToken);
  }

  httpPost(postInfo: any, route: string) {
    var body = JSON.stringify(postInfo);
    return this.http.post(route, body, {headers: contentHeaders})
      .map(this.checkResponse)
      .catch(this.handleError);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem(this.appDescriptionService.jwtTokenKeyName);
    localStorage.removeItem(this.appDescriptionService.userInfoKeyName);
  }

  private checkResponse(res: Response) {
    return res.json();
  }

  private handleError(error: any) {
    var errorText = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errorText);
  }
}
