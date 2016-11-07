import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import {Observable} from "rxjs";
import {EtlFlow} from "../_models/flow.models";
import {contentHeaders} from '../_guards/index';

@Injectable()
export class ETLFlowService {
    constructor(private http: Http) { }

    getAll() {
        return this.http.get('/api/etlFlows', this.jwt()).map((response: Response) => {
          let jsArray = response.json();
          let etlFlows: EtlFlow[] = jsArray.map(jsElement=>{
            return new EtlFlow(JSON.stringify(jsElement));
          });
        return etlFlows;

        }).catch(this.handleError);
    }

    getById(id) {
        return this.http.get('/api/etlFlows/' + id, this.jwt()).map((response: Response) => {
          return new EtlFlow(response.json());
        }).catch(this.handleError);
    }

    // private helper methods
    private jwt() {
      //loopback requires contentHeaders
      return {headers: contentHeaders};
    }

    private handleError(error: any) {
      var errorText = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      return Observable.throw(errorText);
    }
}
