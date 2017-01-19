export interface BaseService {
  server:any;
  init(cb:(err:Error,result:any)=>void):void;
}
