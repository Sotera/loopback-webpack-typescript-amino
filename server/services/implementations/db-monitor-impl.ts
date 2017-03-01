import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from 'firmament-yargs';
import {BaseService} from '../interfaces/base-service';
import {DbMonitor} from '../interfaces/db-monitor';
import {PostalAgent} from 'firmament-vita';
import {Util} from '../../util/util';
import {EtlFile, EtlFlow, EtlBase} from '../../../node_modules/etl-typings/index';
import {
  ProcessFileWithFlowOptions
} from "../../../node_modules/firmament-vita/js/interfaces/vita-options-results";
import * as _ from 'lodash';
const path = require('path');
const async = require('async');
const config = require('../../config.json');

@injectable()
export class DbMonitorImpl implements DbMonitor {
  private etlFileCache: EtlFile[] = [];
  private throttlePublishEtlFileCache: () => void;

  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('IPostal') private postal: IPostal,
              @inject('VitaPostalAgent') private postalAgent: PostalAgent,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    this.commandUtil.log('DbMonitor created');
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    let me = this;

    me.postal.publish({
      channel: 'Loopback',
      topic: 'CreateChangeStream',
      data: {
        className: 'EtlFile',
        collectionChangedCallback: (change) => {
          if (change.type === 'create' || change.type === 'remove') {
            me.writeBackRefreshAndPublishEtlFileCache();
          }
        }
      }
    });
    me.postal.publish({
      channel: 'Loopback',
      topic: 'CreateChangeStream',
      data: {
        className: 'EtlTask',
        collectionChangedCallback: (change) => {
          if (change.type === 'create') {
            me.taskAdded(change.data.fileId, change.data.flowId);
          }
        }
      }
    });
    me.postal.publish({
      channel: 'Loopback',
      topic: 'CreateChangeStream',
      data: {
        className: 'EtlFlow',
        collectionChangedCallback: (change) => {
          if (change.type === 'create') {
            me.writeBackRefreshAndPublishEtlFileCache();
          }
        }
      }
    });
    cb(null, {message: 'Initialized dbMonitor'});

    me.server.on('started', () => {
      /*      me.postal.publish({
       channel: 'Loopback',
       topic: 'FindById',
       data: {
       className: 'EtlFile',
       id: '58ac8fd7da266e6a4392a789',
       callback: (err, etlFile: EtlFile) => {
       if (me.commandUtil.logError(err)) {
       return;
       }
       etlFile.removeFromDb((err) => {
       me.commandUtil.logError(err);
       });
       }
       }
       });*/
      /*      let efc = me.etlFileCache;
       me.refreshEtlFileCache((err, etlFiles) => {
       etlFiles[0].flows[0].steps[0].status = 'BooJiffer';
       me.writeBackEtlFileCache((err) => {
       let e = err;
       });
       });*/
    });
  }

  initSubscriptions(cb: (err: Error, result: any) => void) {
    let me = this;
    me.postal.subscribe({
      channel: 'EtlTask',
      topic: 'AddTask',
      callback: (etlTaskData) => {
        me.postal.publish({
          channel: 'Loopback',
          topic: 'Create',
          data: {
            className: 'EtlTask',
            initializationObject: etlTaskData
          }
        });
      }
    });
    me.postal.subscribe({
      channel: 'EtlFile',
      topic: 'GetAllFiles',
      callback: () => {
        me.writeBackRefreshAndPublishEtlFileCache();
      }
    });
    me.postal.subscribe({
      channel: 'EtlFile',
      topic: 'Delete',
      callback: (fileId) => {
        me.postal.publish({
          channel: 'Loopback',
          topic: 'FindById',
          data: {
            className: 'EtlFile',
            id: fileId.id,
            callback: (err, etlFile: EtlFile) => {
              if (me.commandUtil.logError(err)) {
                return;
              }
              etlFile.removeFromDb((err) => {
                me.commandUtil.logError(err);
              });
            }
          }
        });
      }
    });
    cb(null, {message: 'Initialized dbMonitor Subscriptions'});
  }

  private taskAdded(fileId: string, flowName: string) {
    //This gets called from a DB signal indicating a task was created in the
    //EtlTask DB. Now we need to add a flow to the appropriate EtlFile object
    let me = this;
    me.getModelById(fileId, 'EtlFile', (err, etlFile: EtlFile) => {
      let operationUUID = Util.generateUUID();
      me.postal.subscribe({
        channel: 'FirmamentVita',
        topic: operationUUID,
        callback: (data) => {
          me.writeBackRefreshAndPublishEtlFileCache();
        }
      });
      me.postal.publish({
        channel: 'FirmamentVita',
        topic: 'ProcessFileWithFlow',
        data: <ProcessFileWithFlowOptions>{
          etlFile,
          fileEncryptionPassword: config.decryptPassword,
          flowName,
          operationUUID
        }
      });
    });
  }

  private updateEtlStatus(etlFlow: EtlFlow) {
    let me = this;
    me.commandUtil.log(JSON.stringify(etlFlow, undefined, 2));
    etlFlow.writeToDb((err, etlFlow) => {
      me.writeBackRefreshAndPublishEtlFileCache();
    });

    /*    let etlFile = _.find(me.etlFileCache, ['id', status.tag.fileId]);
     let etlFlow = _.find(etlFile.flows, ['id', status.tag.flowId]);
     let etlStep = _.find(etlFlow.steps, ['name', 'DecryptAndUnTar']);
     if (!etlStep) {
     etlFlow.createStep({name: 'DecryptAndUnTar'}, (err) => {
     me.blowCacheAndPublishAllEtlFiles();
     });
     return;
     }*/
///--->
    /*    EtlFile.findById(status.tag.fileId, (err, etlFile) => {
     me.updatingEtlStatus = false;
     });*/

    /*
     me.etlFile.findById(status.tag.fileId, {
     include: {
     relation: 'flows',
     scope: {
     include: ['steps']
     }
     }
     }, (err, etlFile) => {
     let file = <EtlFile>JSON.parse(JSON.stringify(etlFile));
     let flow = <EtlFlow>_.find(file.flows, ['id', status.tag.flowId]);
     if (status.decryptAndUnTarStatus) {
     let step = <EtlStep>_.find(flow.steps, ['name', 'DecryptAndUnTar']);
     if (!step) {
     me.etlFlow.findById(status.tag.flowId, (err, etlFlow) => {
     let newStep = new EtlStep();
     newStep.name = status.decryptAndUnTarStatus.taskName;
     newStep.start = new Date(status.startTime);
     /!*            etlFlow.steps.create(newStep.etlStepObject, (err, newStep) => {
     me.updatingEtlStatus = false;
     });*!/
     });
     } else {
     me.updatingEtlStatus = false;
     me.etlStep.findById(step.id, (err, etlStep) => {
     let step = new EtlStep(etlStep);
     step.end = new Date(status.currentTime);
     step.save(() => {
     //me.updatingEtlStatus = false;
     //me.publishEtlFileCache();
     });
     });
     }
     }
     });
     */


    //If the state has changed, update it
    /*    if (etlStatus.status != me.stateMap[etlStatus.tag.fileID]) {
     me.stateMap[etlStatus.tag.fileID] = etlStatus.status;
     etlFile.findById(etlStatus.tag.fileID, (err, file) => {
     if (err || !file) {
     let x = err;
     return;
     }
     let fileInfo = file;
     fileInfo.steps = [];

     fileInfo.flows.forEach((flow) => {
     if (flow.id == config.defaultFlowId) {
     if (flow.lastStatus != etlStatus.status) {
     flow.lastStatus = etlStatus.status;
     }
     }
     });

     file.updateAttributes(fileInfo, (err, file) => {
     if (err || !file) {
     let e = err;
     }
     });
     })
     }*/
///--->
  }

  private appendEtlResults(status) {
    let me = this;
    me.commandUtil.log(JSON.stringify(status, undefined, 2));
    me.publishEtlFileCache();

    /*    let etlFile = me.server.models.EtlFile;

     etlFile.findById(apdFile.tag.fileID, (err, file) => {
     if (err || !file) {
     let x = err;
     return;
     }
     let fileInfo = file;
     fileInfo.flows[0].lastStatus = apdFile.status;

     // //Build decryptStep
     let decryptSrc = {
     id: me.generateUUID(),
     path: file.path + file.name,
     type: ".enc"
     };

     let decryptProds = [];
     apdFile.decryptAndUnTarResults.forEach((result) => {
     result.zipFiles.forEach((zipfile) => {
     let newZip = {
     id: me.generateUUID(),
     path: zipfile,
     type: ".pcap.gz"
     };
     decryptProds.push(newZip)
     });
     });

     let decryptStep = {
     id: me.generateUUID(),
     index: 1,
     name: "Decrypt and Untar",
     start: apdFile.startTime,
     end: apdFile.endTime,
     result: "Success",
     source: decryptSrc,
     products: decryptProds
     };

     fileInfo.flows[0].steps.push(decryptStep);

     //TODO
     // Build unzipStep
     let unzipSrc = {
     id: me.generateUUID(),
     path: 'xx',
     type: ".pcap.gz"
     };
     let unzipProds = [];
     apdFile.unZipFileResults.forEach((result) => {
     result.forEach((zipfile) => {
     let newZipProd = {
     id: me.generateUUID(),
     path: zipfile.unzippedFilePath,
     type: ".pcap.gz"
     };
     unzipProds.push(newZipProd);
     });
     });

     let unzipStep = {
     id: me.generateUUID(),
     index: 2,
     name: "Unzip",
     start: apdFile.startTime,
     end: apdFile.endTime,
     result: "Success",
     source: unzipSrc,
     products: unzipProds
     };

     fileInfo.flows[0].steps.push(unzipStep);

     //TODO
     // //Build mergeStep
     let mergeSrc = {
     id: me.generateUUID(),
     path: 'xx',
     type: ".pcap"
     };
     let mergeProds = [{
     id: me.generateUUID(),
     path: apdFile.mergePcapFilesResult.mergedPcapFile,
     type: ".pcap"
     }];

     let mergeStep = {
     id: me.generateUUID(),
     index: 3,
     name: "Mergecap",
     start: apdFile.startTime,
     end: apdFile.endTime,
     result: "Success",
     source: mergeSrc,
     products: mergeProds
     };

     fileInfo.flows[0].steps.push(mergeStep);

     file.updateAttributes(fileInfo, (err, file) => {
     delete me.stateMap[apdFile.tag.fileID];
     });
     })*/
  }

  private writeBackRefreshAndPublishEtlFileCache(cb: ((err) => void) = null) {
    let me = this;
    me.writeBackEtlFileCache(() => {
      me.refreshEtlFileCache((err) => {
        me.publishEtlFileCache();
        Util.checkCallback(cb)(err);
      });
    });
  }


  private publishEtlFileCache() {
    let me = this;
    if(!me.throttlePublishEtlFileCache){
      me.throttlePublishEtlFileCache = _.throttle(() => {
        me.postal.publish({
          channel: 'WebSocket',
          topic: 'Broadcast',
          data: {
            channel: 'EtlFile',
            topic: 'AllFiles',
            data: me.etlFileCache.map((etlFile) => {
              let retVal = etlFile.getPojo();
              return retVal;
            })
          }
        });
      }, 1500);
    }
    me.throttlePublishEtlFileCache();
  }

  private writeBackEtlFileCache(cb: (err) => void) {
    async.each(this.etlFileCache, (etlFile: EtlFile, cb) => {
      etlFile.writeToDb(cb);
    }, cb);
  }

  private refreshEtlFileCache(cb: (err, etlFiles: EtlFile[]) => void) {
    let me = this;
    me.postal.publish({
      channel: 'Loopback',
      topic: 'Find',
      data: {
        className: 'EtlFile',
        filter: {order: 'createDate DESC'},
        callback: (err, etlFiles: EtlFile[]) => {
          async.map(etlFiles, (etlFile: EtlFile, cb) => {
            etlFile.loadEntireObject(cb);
          }, (err, etlFiles) => {
            me.etlFileCache = etlFiles;
            Util.checkCallback(cb)(err, etlFiles);
          });
        }
      }
    });
  }

  private getModelByAminoId(aminoId: string, className: string, callback: (err, etlBase: EtlBase) => void) {
    this.postal.publish({channel: 'Loopback', topic: 'FindByAminoId', data: {className, aminoId, callback}});
  }

  private getModelById(id: string, className: string, cb: (err, etlBase?: EtlBase) => void) {
    let me = this;
    //Look for it in the cache
    if (className === 'EtlFile') {
      let etlFile = _.find(me.etlFileCache, (f) => {
        return f.id.toString() === id;
      });
      if (!etlFile) {
        me.refreshEtlFileCache(() => {
          let etlFile = _.find(me.etlFileCache, (f) => {
            return f.id.toString() === id;
          });
          if (!etlFile) {
            cb(new Error('Not Found'));
            return;
          }
          cb(null, etlFile);
        });
      }
      cb(null, etlFile);
    }
  }
}
