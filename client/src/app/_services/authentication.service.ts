import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {contentHeaders} from '../_guards/index';
import 'rxjs/add/operator/map'
import {Observable} from "rxjs";
import {AppDescriptionService} from "./app-description.service";

@Injectable()
export class AuthenticationService {
  constructor(
    private http: Http,
    private appDescriptionService: AppDescriptionService
  ) {
  }

  register(userInfo: LoginUserInfo) {
    return this.httpPost(userInfo, '/auth/register');
  }

  login(userInfo: LoginUserInfo) {
    return this.httpPost(userInfo, '/auth/login');
  }

  httpPost(loginUserInfo: LoginUserInfo, route: string) {
    var body = JSON.stringify(loginUserInfo);
    return this.http.post(route, body, {headers: contentHeaders})
      .map(this.checkResponse)
      .catch(this.handleError);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem(this.appDescriptionService.jwtTokenName);
    localStorage.removeItem(this.appDescriptionService.loopbackTokenName);
  }

  setJwtToken(jwtToken: string) {
    localStorage.setItem(this.appDescriptionService.jwtTokenName, jwtToken);
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
