import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {DbMonitor} from "../interfaces/db-monitor";
import {FullPipeline, VitaTasks} from "firmament-vita";
import * as _ from 'lodash';
import {EtlFlow} from "../../../common/modelClasses/etl-flow";
import {EtlFile} from "../../../common/modelClasses/etl-file";
import {EtlStep} from "../../../common/modelClasses/etl-step";
import {EtlBase} from "../../../common/modelClasses/etl-base";

const path = require('path');
const config = require('../../config.json');
const async = require('async');

@injectable()
export class DbMonitorImpl implements DbMonitor {
  private updatingEtlStatus: boolean = false;
  private etlFileCache: EtlFile[];
  private etlFile: any;
  private etlTask: any;
  private etlFlow: any;
  private etlStep: any;

  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('IPostal') private postal: IPostal,
              @inject('FullPipeline') private fullPipeline: FullPipeline,
              @inject('VitaTasks') private vitaTasks: VitaTasks,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    //TODO: Break model init out into its own service
    EtlBase.server = this.server;

    this.commandUtil.log('DbMonitor created');
    this.etlFile = this.server.models.EtlFile;
    this.etlFlow = this.server.models.EtlFlow;
    this.etlTask = this.server.models.EtlTask;
    this.etlStep = this.server.models.EtlStep;
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    let me = this;
    me.createChangeStream_EtlFile();
    me.createChangeStream_EtlTask();
    me.createChangeStream_EtlStep();

    //TODO: Park this subscription here temporarily until we design the subscription service
    me.postal.subscribe({
      channel: 'EtlTask',
      topic: 'AddTask',
      callback: (etlTaskData) => {
        me.etlTask.create(etlTaskData, err => {
          this.commandUtil.logError(err);
        });
      }
    });
    me.postal.subscribe({
      channel: 'EtlFile',
      topic: 'GetAllFiles',
      callback: () => {
        me.publishAllEtlFiles();
      }
    });
    me.postal.subscribe({
      channel: 'EtlFile',
      topic: 'Delete',
      callback: (fileId) => {
        me.etlFile.destroyById(fileId.id, err => {
          this.commandUtil.logError(err);
        });
      }
    });
    me.loadEtlFileCache(err => {
      cb(err, {message: 'Initialized dbMonitor'});
    })
    /*    setTimeout(() => {
     me.taskAdded('588e2c3c61e2fe637472be8f', 'Bro');
     }, 3000);*/
  }

  private createChangeStream_EtlFile() {
    let me = this;
    me.etlFile.createChangeStream((err, changes) => {
      changes.on('data', () => {
        me.blowCacheAndPublishAllEtlFiles();
      });
    });
  }

  private createChangeStream_EtlStep() {
    let me = this;
    me.etlStep.createChangeStream((err, changes) => {
      changes.on('data', () => {
        me.blowCacheAndPublishAllEtlFiles();
      });
    });
  }

  private blowCacheAndPublishAllEtlFiles() {
    let me = this;
    me.loadEtlFileCache(() => {
      me.publishAllEtlFiles();
    });
  }

  private createChangeStream_EtlTask() {
    let me = this;
    me.etlTask.createChangeStream((err, changes) => {
      changes.on('data', (change) => {
        if (change.type === 'create') {
          me.taskAdded(change.data.fileId, change.data.flowId);
        }
      });
    });
  }

  private taskAdded(fileId: string, flowId: string) {
    let me = this;
    EtlFile.findById(fileId, (err, etlFile: EtlFile) => {
      if (me.commandUtil.logError(err)) {
        return;
      }
      etlFile.createFlow({name: flowId}, (err, etlFlow: EtlFlow) => {
        if (me.commandUtil.logError(err)) {
          return;
        }
        me.fullPipeline.tag = {fileId, flowId: etlFlow.id};
        me.fullPipeline.decryptAndUnTarOptions.encryptedFiles = [path.resolve(etlFile.path, etlFile.name)];
        me.fullPipeline.decryptAndUnTarOptions.password = config.decryptPassword;
        me.fullPipeline.mergePcapFilesOptions.mergedPcapFile = 'mergedMike.pcap';

        me.vitaTasks.processFullPipelineInstance(me.fullPipeline, (err, status: any) => {
          me.commandUtil.log(JSON.stringify(status, undefined, 2));
          me.updateEtlStatus(status);
        }, (err, result) => {
          me.appendEtlResults(result);
        });
      });
    });
  }

  private updateEtlStatus(status: any) {
    let me = this;
    if (me.updatingEtlStatus) {
      return;
    }
    me.updatingEtlStatus = true;

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
            /*            etlFlow.steps.create(newStep.etlStepObject, (err, newStep) => {
             me.updatingEtlStatus = false;
             });*/
          });
        } else {
          me.updatingEtlStatus = false;
          me.etlStep.findById(step.id, (err, etlStep) => {
            let step = new EtlStep(etlStep);
            step.end = new Date(status.currentTime);
            step.save(() => {
              //me.updatingEtlStatus = false;
              //me.publishAllEtlFiles();
            });
          });
        }
      }
      /*      file.flows({where: {id: status.tag.flowId}}, (err, foundFlows) => {
       if(foundFlows.length !== 1){

       }
       let f = foundFlows[0];
       f = foundFlows[0];
       });*/
    });


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
  }

  private appendEtlResults(apdFile) {
    let me = this;
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

  private publishAllEtlFiles() {
    let me = this;
    me.postal.publish({
      channel: 'WebSocket',
      topic: 'Broadcast',
      data: {
        channel: 'EtlFile',
        topic: 'AllFiles',
        data: me.etlFileCache
      }
    });
  }

  private writeEtlFileCache(cb: (err: Error, etlFiles: EtlFile[]) => void) {
    let me = this;
    let fnArray = [];
    me.etlFileCache.forEach(etlFile => {
      etlFile.flows.forEach(etlFlow => {
        etlFlow.steps.forEach(etlStep => {
          if (!etlStep.isDirty) {
            return;
          }
          fnArray.push(async.apply(me.etlStep.updateAttributes.bind(me.etlStep), etlStep));
        });
        if (!etlFlow.isDirty) {
          return;
        }
        fnArray.push(async.apply(me.etlFlow.updateAttributes.bind(me.etlFlow), etlFlow));
      });
      if (!etlFile.isDirty) {
        return;
      }
      fnArray.push(async.apply(me.etlFile.updateAttributes.bind(me.etlFile), etlFile));
    });
    async.parallel(fnArray, err => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      me.loadEtlFileCache(cb);
    });
  }

  private loadEtlFileCache(cb: (err: Error, etlFiles: EtlFile[]) => void) {
    let me = this;
    me.etlFile.find({
      include: {
        relation: 'flows',
        scope: {
          include: ['steps']
        }
      }
    }, (err, etlFiles) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      let etlFilesAsObjects = JSON.parse(JSON.stringify(etlFiles));
      me.etlFileCache = etlFilesAsObjects.sort((a, b) => {
        let dateA = new Date(a.createDate);
        let dateB = new Date(b.createDate);
        return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
      });
      cb(err, me.etlFileCache);
    });
  };

  /*  private generateUUID() {
   let d = new Date().getTime();
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
   let r = (d + Math.random() * 16) % 16 | 0;
   d = Math.floor(d / 16);
   return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
   });
   }*/
}
