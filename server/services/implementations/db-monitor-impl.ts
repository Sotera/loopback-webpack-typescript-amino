import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {DbMonitor} from "../interfaces/db-monitor";
import {FullPipeline, VitaTasks} from "firmament-vita";

const path = require('path');
const config = require('../../config.json');

@injectable()
export class DbMonitorImpl implements DbMonitor {
  private stateMap = {};

  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('IPostal') private postal: IPostal,
              @inject('FullPipeline') private fullPipeline: FullPipeline,
              @inject('VitaTasks') private vitaTasks: VitaTasks,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    this.commandUtil.log('DbMonitor created');
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    let me = this;
    let etlTask = me.server.models.EtlTask;
    let etlFile = me.server.models.EtlFile;
    etlTask.createChangeStream(function (err, changes) {
      changes.on('data', function (change) {
        if (change.type === "create") {
          etlFile.findById(change.data.fileId.toString(), function (err, file) {
            if (err || !file) {
              return;
            }
            //Append Flow to File object in database
            let id = config.defaultFlowId;
            let newFlow = {
              id,
              lastStatus: 'Queued',
              name: 'Bro'
            };
            file.etlFlows.create(newFlow, function (err, flow) {
              if (err || !flow) {
                return;
              }
            });

            //Kick off Flow process
            me.stateMap[file.id.toString()] = "Queued";
            me.fullPipeline.tag = {
              fileID: file.id.toString(),
              flowID: config.defaultFlowId
            };
            me.fullPipeline.decryptAndUnTarOptions.encryptedFiles = [path.resolve(file.path, file.name)];
            me.fullPipeline.decryptAndUnTarOptions.password = config.decryptPassword;
            me.fullPipeline.mergePcapFilesOptions.mergedPcapFile = 'mergedMike.pcap';

            me.vitaTasks.processFullPipelineInstance(me.fullPipeline, (err, result) => {
              me.updateEtlStatus(result);
            }, (err, result) => {
              me.appendEtlResults(result);
            });
          });
        }
      });
    });
    cb(null, null);
  }

  private updateEtlStatus(updFile) {
    let me = this;
    let etlFile = me.server.models.EtlFile;

    //If the state has changed, update it
    if (updFile.status != me.stateMap[updFile.tag.fileID]) {
      me.stateMap[updFile.tag.fileID] = updFile.status;
      etlFile.findById(updFile.tag.fileID, function (err, file) {
        if (err || !file) {
          let x = err;
          return;
        }
        let fileInfo = file;
        fileInfo.steps = [];

        fileInfo.flows.forEach(function (flow) {
          if (flow.id == config.defaultFlowId) {
            if (flow.lastStatus != updFile.status) {
              flow.lastStatus = updFile.status;
            }
          }
        });

        file.updateAttributes(fileInfo, function (err, file) {
          if (err || !file) {
            let e = err;
          }
        });
      })
    }
  }

  private appendEtlResults(apdFile) {
    let me = this;
    let etlFile = me.server.models.EtlFile;

    etlFile.findById(apdFile.tag.fileID, function (err, file) {
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
      apdFile.decryptAndUnTarResults.forEach(function (result) {
        result.zipFiles.forEach(function (zipfile) {
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
      apdFile.unZipFileResults.forEach(function (result) {
        result.forEach(function (zipfile) {
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

      file.updateAttributes(fileInfo, function (err, file) {
        delete me.stateMap[apdFile.tag.fileID];
      });
    })
  }


  private generateUUID() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
}
