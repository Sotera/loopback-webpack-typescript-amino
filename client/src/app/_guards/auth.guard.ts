﻿//JReeme shamelessly lifted this from:
//http://jasonwatmore.com/post/2016/09/29/angular-2-user-registration-and-login-example-tutorial
import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {tokenNotExpired} from 'angular2-jwt';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {
  }

  canActivate() {
    if (tokenNotExpired()) {
      // logged in so return true
      return true;
    }
    // not logged in so redirect to login page
    this.router.navigate(['/login']);
    return false;
  }
}