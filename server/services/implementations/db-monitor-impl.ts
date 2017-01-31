import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {DbMonitor} from "../interfaces/db-monitor";
import {FullPipeline, VitaTasks} from "firmament-vita";
import * as _ from 'lodash';
import {EtlFlow} from "../../../common/modelClasses/etl-flow";
import {EtlFile} from "../../../common/modelClasses/etl-file";
import {EtlStep} from "../../../common/modelClasses/etl-step";

const path = require('path');
const config = require('../../config.json');
const async = require('async');

interface EtlStatus {
  tag: any,
  streamId: string,
  flowId: string,
  stepId: string,
  status: string,
  startTime: Date,
  currentTime: Date,
  finishTime: Date,
  currentProgress: number,
  overallProgress: number
}

@injectable()
export class DbMonitorImpl implements DbMonitor {
  private updatingEtlStatus: boolean = false;
  private etlFile: any;
  private etlTask: any;
  private etlFlow: any;
  private etlStep: any;

  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('IPostal') private postal: IPostal,
              @inject('FullPipeline') private fullPipeline: FullPipeline,
              @inject('VitaTasks') private vitaTasks: VitaTasks,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
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
    cb(null, {message: 'Initialized dbMonitor'});
    /*    setTimeout(() => {
     me.taskAdded('588e2c3c61e2fe637472be8f', 'Bro');
     }, 3000);*/
  }

  private createChangeStream_EtlFile() {
    let me = this;
    me.etlFile.createChangeStream((err, changes) => {
      changes.on('data', () => {
        me.publishAllEtlFiles();
      });
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
    async.waterfall([
      (cb) => {
        me.etlFlow.find({where: {name: flowId}, include: ['steps']}, cb);
      },
      (flows, cb) => {
        flows = JSON.parse(JSON.stringify(flows));
        let flow = _.find(flows, (flow: any) => {
          return !flow.etlFileId;
        });

        me.etlFile.findById(fileId, {include: ['flows']}, (err, file) => {
          flow = _.omit(flow, ['id']);
          file.flows.create(flow, (err, newFlow) => {
            if (me.commandUtil.callbackIfError(cb, err)) {
              return;
            }
            cb(err, fileId, newFlow.id.toString());
            /*            async.each(flow.steps, (step, cb2) => {
             step = _.omit(step, ['id']);
             newFlow.steps.create(step, cb2);
             }, err => {
             cb(err, fileId);
             });*/
          });
        });
      },
      (fileId, flowId, cb) => {
        me.etlFile.findById(fileId, (err, file) => {
          file = JSON.parse(JSON.stringify(file));
          cb(err, file, fileId, flowId);
        });
      }
    ], (err, file, fileId, flowId) => {
      me.fullPipeline.tag = {fileId, flowId};
      me.fullPipeline.decryptAndUnTarOptions.encryptedFiles = [path.resolve(file.path, file.name)];
      me.fullPipeline.decryptAndUnTarOptions.password = config.decryptPassword;
      me.fullPipeline.mergePcapFilesOptions.mergedPcapFile = 'mergedMike.pcap';

      me.vitaTasks.processFullPipelineInstance(me.fullPipeline, (err, status: any) => {
        me.commandUtil.log(JSON.stringify(status, undefined, 2));
        me.updateEtlStatus(status);
      }, (err, result) => {
        me.appendEtlResults(result);
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
            newStep.name = 'DecryptAndUnTar';
            etlFlow.steps.create(newStep, (err, newStep) => {
              me.updatingEtlStatus = false;
              me.publishAllEtlFiles();
            });
          });
        } else {
          me.etlStep.findById(step.id, (err, etlStep) => {
            me.updatingEtlStatus = false;
            me.publishAllEtlFiles();
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
    let etlFile = me.server.models.EtlFile;
    etlFile.find({
      include: {
        relation: 'flows',
        scope: {
          include: ['steps']
        }
      }
    }, (err, etlFiles) => {
      if (err) {
        me.commandUtil.logError(err);
        return;
      }
      //let test = JSON.parse(JSON.stringify(etlFiles));
      let etlFilesSortedByDate = etlFiles.sort((a, b) => {
        a = new Date(a.createDate);
        b = new Date(b.createDate);
        return a > b ? -1 : a < b ? 1 : 0;
      });
      me.postal.publish({
        channel: 'WebSocket',
        topic: 'Broadcast',
        data: {
          channel: 'EtlFile',
          topic: 'AllFiles',
          data: etlFilesSortedByDate
        }
      });
    });
  }

  private generateUUID() {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
