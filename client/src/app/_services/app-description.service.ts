import {Injectable} from '@angular/core';

@Injectable()
export class AppDescriptionService {
  private _appName:string = 'Amino 2';
  private _jwtTokenName:string = 'Amino_2_jwtTokenName';
  private _loopbackTokenName:string = 'Amino_2_loopbackTokenName';
  constructor() {
  }
  get loopbackTokenName():string{
    return this._loopbackTokenName;
  }
  get jwtTokenName():string{
    return this._jwtTokenName;
  }
  get appName():string{
    return this._appName;
  }
/*  set appName(newAppName:string){
    this._appName = newAppName;
  }*/
}
