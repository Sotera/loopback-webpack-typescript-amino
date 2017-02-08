import {Injectable} from '@angular/core';
import {IPostal, ICallback, IEnvelope} from 'firmament-yargs';
import {Http, Response} from "@angular/http";
import {$WebSocket} from "angular2-websocket/angular2-websocket";
import {contentHeaders} from '../_guards/index';
import {Observable, Subject} from "rxjs";
import {WebSocketService} from "./websocket.service";
let postal: IPostal = require('postal');

export enum PublishTarget{
  server,
  local,
  serverAndLocal
}

@Injectable()
export class PostalService {
  public messages: Subject<IEnvelope<any>>;

  constructor(private http: Http,
              private webSocketService: WebSocketService) {
    this.init();
  }

  private init() {
    let observable = this.http.get('/util/get-websocket-port', {headers: contentHeaders})
      .map((response: Response): WebSocketInfo => {
        return response.json();
      }).catch(this.handleError);

    observable.subscribe((webSocketInfo: WebSocketInfo) => {
        this.messages = <Subject<IEnvelope<any>>>this.webSocketService
          .connect(webSocketInfo.uri)
          .map((response: MessageEvent): IEnvelope<any> => {
            return JSON.parse(response.data);
          }).catch(this.handleError);
      },
      err => {
        console.log(this.getErrorText(err));
      });
  }

  publish(channel: string,
          topic: string,
          data: any,
          publishTarget: PublishTarget = PublishTarget.serverAndLocal) {
    if (!this.messages) {
      alert('No Messages');
      return;
    }
    let envelope = {channel, topic, data};
    if (publishTarget === PublishTarget.serverAndLocal || publishTarget === PublishTarget.server) {
      this.messages.next(envelope);
    }
    if (publishTarget === PublishTarget.serverAndLocal || publishTarget === PublishTarget.local) {
      postal.publish(envelope);
    }
  }

  subscribe(channel: string, topic: string, cb: ICallback<any>) {
    if (!this.messages) {
      setTimeout(() => {
        this.subscribe(channel, topic, cb);
      }, 1000);
      return;
    }
    //Subscribe to WebSocket
    this.messages.subscribe(postalMessage => {
      //alert(postalMessage.channel);
      postal.publish(postalMessage);
    });
    //Subscribe to Postal
    let envelope = {
      channel,
      topic,
      callback: (data, env) => {
        //alert(JSON.stringify(`Postal Sub: ${data}`));
        cb(data, env);
      }
    }
    //alert(JSON.stringify(envelope));
    postal.subscribe(envelope);
  }

  private handleError(err: any) {
    return Observable.throw(this.getErrorText(err));
  }

  private getErrorText(error: any) {
    return (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
  }
}

