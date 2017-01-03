import {Injectable} from '@angular/core';

@Injectable()
export class AppDescriptionService {
  private _appName:string = 'VITA Portal';
  private _jwtTokenKeyName:string = 'Amino_2_jwtTokenKeyName';
  private _userInfoKeyName:string = 'Amino_2_userInfoKeyName';
  constructor() {
  }
  get jwtTokenKeyName():string{
    return this._jwtTokenKeyName;
  }
  get userInfoKeyName():string{
    return this._userInfoKeyName;
  }
  get appName():string{
    return this._appName;
  }
/*  set appName(newAppName:string){
    this._appName = newAppName;
  }*/
}
