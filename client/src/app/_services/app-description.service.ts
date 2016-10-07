import {Injectable} from '@angular/core';

@Injectable()
export class AppDescriptionService {
  private _appName:string = 'Amino 2';
  constructor() {
  }
  get appName():string{
    return this._appName;
  }
  set appName(newAppName:string){
    this._appName = newAppName;
  }
}
