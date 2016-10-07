import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {contentHeaders} from '../_guards/index';
import 'rxjs/add/operator/map'
import {Observable} from "rxjs";

@Injectable()
export class AuthenticationService {
  constructor(private http: Http) {
  }

  register(userInfo:LoginUserInfo) {
    return this.httpPost(userInfo, '/auth/register');
  }

  login(userInfo:LoginUserInfo) {
    return this.httpPost(userInfo, '/auth/login');
  }

  httpPost(loginUserInfo:LoginUserInfo, route:string) {
    var body = JSON.stringify(loginUserInfo);
    return this.http.post(route, body, {headers: contentHeaders})
      .map(this.checkResponse)
      .catch(this.handleError);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
  }

  private checkResponse(res: Response){
    var retVal = res.json();
    if(retVal.status && retVal.status === 'error'){
      var error = retVal.error;
      var errorText = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      return Observable.throw(errorText);
    }
    return retVal;
  }

  private handleError(error: any) {
    var errorText = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errorText);
  }
}
