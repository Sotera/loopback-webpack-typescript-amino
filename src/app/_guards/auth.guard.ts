//JReeme shamelessly lifted this from:
//http://jasonwatmore.com/post/2016/09/29/angular-2-user-registration-and-login-example-tutorial
import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {tokenNotExpired} from 'angular2-jwt';
import {AppDescriptionService} from "../_services/app-description.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private appDescriptionService: AppDescriptionService
  ) {
  }

  canActivate() {
    try{
      if(tokenNotExpired(this.appDescriptionService.jwtTokenKeyName)){
        return true;
      }
    }catch(err){
      return false;
    }
    // not logged in so redirect to login page
    this.router.navigate(['/login']);
    return false;
  }
}
