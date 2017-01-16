import {Injectable} from '@angular/core';
import {IPostal} from 'firmament-yargs';
import {Http, Response} from "@angular/http";
import {contentHeaders} from '../_guards/index';
import {Observable} from "rxjs";
let postal: IPostal = require('postal');

@Injectable()
export class PostalService {
  constructor(private http: Http) {
    this.init();
  }

  init() {
    alert('PostalService init');
    return this.http.get('/util/get-websocket-port', {headers: contentHeaders})
      .map((response: Response) => {
        alert(JSON.stringify(response.json()));
        return [];
      }).catch(this.handleError);
  }

  yummy(msg: string) {
    /*    postal.publish({
     channel: 'CommandUtil',
     topic: 'SuppressConsoleOutput',
     data: {
     suppressConsoleOutput: msg
     }
     });*/
  }

  private handleError(error: any) {
    let errorText = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errorText);
  }
}

