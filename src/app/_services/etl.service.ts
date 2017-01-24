import {Injectable, Inject} from '@angular/core';
import {Http, Response} from '@angular/http';
import {contentHeaders} from '../_guards/index';
import {Observable} from 'rxjs';
import {EtlFile, EtlFlow, EtlResource, EtlStep, EtlTask} from '../_models/flow.models';
import {PostalService, PublishTarget} from './postal.service';

@Injectable()
export class ETLService {
  constructor(private http: Http,
              private postalService: PostalService) {
  }

  luvFiles() {
/*    alert('luving it');
    this.postalService.publish('WebSocketTest', 'TestTopic', {how: 'now', brown: 'cow'}, PublishTarget.local);*/
  }

  getFiles() {
    return this.http.get('/api/etlFiles?filter=%7B%22include%22%3A%22tasks%22%7D', {headers: contentHeaders})
      .map((response: Response) => {
        let jsArray = response.json();
        let etlFiles: EtlFile[] = jsArray.map(jsElement => {
          return new EtlFile(JSON.stringify(jsElement));
        });
        return etlFiles;
      }).catch(this.handleError);
  }

  getFileById(id) {
    return this.httpGet('/api/etlFiles/' + id).map((response: Response) => {
      return new EtlFile(response.json());
    }).catch(this.handleError);
  }

  updateFile(etlFile: EtlFile) {
    return this.httpPut(etlFile, '/api/etlFiles');
  }

  processFile(etlTask: EtlTask) {
    return this.httpPost(etlTask, '/api/EtlFiles/' + etlTask.fileId + '/tasks');
  }

  deleteFile(id) {
    return this.httpDelete('/api/etlFiles/' + id).map((response: Response) => response.json());
  }

  getFlows() {
    return this.http.get('/api/etlFlows', this.jwt()).map((response: Response) => {
      let jsArray = response.json();
      let etlFlows: EtlFlow[] = jsArray.map(jsElement => {
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
      let etlResources: EtlResource[] = jsArray.map(jsElement => {
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
      let etlSteps: EtlStep[] = jsArray.map(jsElement => {
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

  deleteStep(flowStep) {
    return this.httpDelete('/api/EtlFlows/' + flowStep.flowId + '/etlSteps/' + flowStep.stepId).map((response: Response) => response.json());
  }

  processStep(flowId, etlStep: EtlStep) {
    return this.httpPost(etlStep, '/api/EtlFlows/' + flowId + '/steps');
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

  httpPost(postInfo: any, route: string) {
    var body = JSON.stringify(postInfo);
    return this.http.post(route, body, this.jwt())
      .map(this.checkResponse)
      .catch(this.handleError);
  }

  httpPut(postInfo: any, route: string) {
    var body = JSON.stringify(postInfo);
    return this.http.put(route, body, this.jwt())
      .map(this.checkResponse)
      .catch(this.handleError);
  }

  httpDelete(route: string) {
    return this.http.delete(route, this.jwt())
      .map(this.checkResponse)
      .catch(this.handleError);
  }

  httpGet(route: string) {
    return this.http.get(route, this.jwt())
      .map(this.checkResponse)
      .catch(this.handleError);
  }

  private checkResponse(res: Response) {
    return res.json();
  }
}

