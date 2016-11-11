import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import {Observable} from "rxjs";
import {EtlFile, EtlFlow, EtlResource, EtlStep} from "../_models/flow.models";
import {contentHeaders} from '../_guards/index';

@Injectable()
export class ETLService {
  constructor(private http: Http) { }

  getFiles() {
    return this.http.get('/api/etlFiles', this.jwt()).map((response: Response) => {
      let jsArray = response.json();
      let etlFiles: EtlFile[] = jsArray.map(jsElement=>{
        return new EtlFile(JSON.stringify(jsElement));
      });
      return etlFiles;

    }).catch(this.handleError);
  }

  getFileById(id) {
    return this.http.get('/api/etlFiles/' + id, this.jwt()).map((response: Response) => {
      return new EtlFile(response.json());
    }).catch(this.handleError);
  }

  getFlows() {
    return this.http.get('/api/etlFlows', this.jwt()).map((response: Response) => {
      let jsArray = response.json();
      let etlFlows: EtlFlow[] = jsArray.map(jsElement=>{
        return new EtlFlow(JSON.stringify(jsElement));
      });
      return etlFlows;

    }).catch(this.handleError);
  }

  getFlowById(id) {
    return this.http.get('/api/etlFlows/' + id, this.jwt()).map((response: Response) => {
      return new EtlFlow(response.json());
    }).catch(this.handleError);
  }

  getResources() {
    return this.http.get('/api/etlResources', this.jwt()).map((response: Response) => {
      let jsArray = response.json();
      let etlResources: EtlResource[] = jsArray.map(jsElement=>{
        return new EtlResource(JSON.stringify(jsElement));
      });
      return etlResources;

    }).catch(this.handleError);
  }

  getResourceById(id) {
    return this.http.get('/api/etlResources/' + id, this.jwt()).map((response: Response) => {
      return new EtlResource(response.json());
    }).catch(this.handleError);
  }

  getSteps() {
    return this.http.get('/api/etlSteps', this.jwt()).map((response: Response) => {
      let jsArray = response.json();
      let etlSteps: EtlStep[] = jsArray.map(jsElement=>{
        return new EtlStep(JSON.stringify(jsElement));
      });
      return etlSteps;

    }).catch(this.handleError);
  }

  getStepById(id) {
    return this.http.get('/api/etlResources/' + id, this.jwt()).map((response: Response) => {
      return new EtlResource(response.json());
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

