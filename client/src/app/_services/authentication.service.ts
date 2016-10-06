import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {contentHeaders} from '../_guards/index';
import 'rxjs/add/operator/map'
import {Observable} from "rxjs";

@Injectable()
export class AuthenticationService {
  constructor(private http: Http) {
  }

  login(username, password) {
    var body = JSON.stringify({username: username, password: password});
    return this.http.post('/sessions/create', body, {headers: contentHeaders})
      .map(this.checkAuthenticationResponse)
      .catch(this.handleError);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
  }

  private checkAuthenticationResponse(res: Response){
    return res.json();
  }

  private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
