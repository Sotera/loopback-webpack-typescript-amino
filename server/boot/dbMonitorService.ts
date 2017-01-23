/*import kernel from '../inversify.config';
import {VitaTasks} from "firmament-vita/js/interfaces/vita-tasks";
import {FullPipeline} from "firmament-vita/js/interfaces/vita-options-results";

let request = require('request');
let config = require('../config.json');
const path = require('path');*/

module.exports = function (app) {
/*
  let etlTask = app.models.EtlTask;
  let etlFile = app.models.EtlFile;
  let stateMap = {};

  let vitaTasks: VitaTasks = kernel.get<VitaTasks>('VitaTasks');
  let fullPipeline: FullPipeline = kernel.get<FullPipeline>('FullPipeline');

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
            lastStatus:'Queued',
            name:'Bro'
          };
          file.etlFlows.create(newFlow, function (err, flow) {
            if (err || !flow) {
              return;
            }
          });

          //Kick off Flow process
          stateMap[file.id.toString()] = "Queued";
          fullPipeline.tag = {
            fileID: file.id.toString(),
            flowID: config.defaultFlowId
          };
          fullPipeline.decryptAndUnTarOptions.encryptedFiles = [path.resolve(file.path,file.name)];
          fullPipeline.decryptAndUnTarOptions.password = config.decryptPassword;
          fullPipeline.mergePcapFilesOptions.mergedPcapFile = 'mergedMike.pcap';

          vitaTasks.processFullPipelineInstance(fullPipeline,(err,result)=>{
            let e = err;
            updateEtlStatus(result);
          },(err,result)=>{
            let e = err;
            appendEtlResults(result);
          });

        });
      }
    });
  });

  function updateEtlStatus(updFile) {
    let etlFile = app.models.EtlFile;

    //If the state has changed, update it
    if(updFile.status != stateMap[updFile.tag.fileID]){
      stateMap[updFile.tag.fileID] = updFile.status;
      etlFile.findById(updFile.tag.fileID, function (err, file) {
        if (err || !file) {
          let x = err;
          return;
        }
        let fileInfo = file;
        fileInfo.steps=[];

        fileInfo.flows.forEach(function (flow) {
          if(flow.id == config.defaultFlowId){
            if(flow.lastStatus != updFile.status){
              flow.lastStatus = updFile.status;
            }
          }
        });

        file.updateAttributes(fileInfo,function(err,file){
          if (err || !file) {
            let e = err;
          }
        });
      })
    }

  }

  function appendEtlResults(apdFile) {
    let etlFile = app.models.EtlFile;

    etlFile.findById(apdFile.tag.fileID, function (err, file) {
      if (err || !file) {
        let x = err;
        return;
      }
      let fileInfo = file;
      fileInfo.flows[0].lastStatus = apdFile.status;

      // //Build decryptStep
      let decryptSrc = {
        id:generateUUID(),
        path: file.path + file.name,
        type: ".enc"
      };

      let decryptProds = [];
      apdFile.decryptAndUnTarResults.forEach(function (result) {
        result.zipFiles.forEach(function(zipfile){
          let newZip  ={
            id:generateUUID(),
            path: zipfile,
            type: ".pcap.gz"
          };
          decryptProds.push(newZip)
        });
      });

      let decryptStep = {
        id:generateUUID(),
        index:1,
        name:"Decrypt and Untar",
        start:apdFile.startTime,
        end:apdFile.endTime,
        result:"Success",
        source:decryptSrc,
        products:decryptProds
      };

      fileInfo.flows[0].steps.push(decryptStep);

      //TODO
      // Build unzipStep
      let unzipSrc = {
        id:generateUUID(),
        path: 'xx',
        type: ".pcap.gz"
      };
      let unzipProds = [];
      apdFile.unZipFileResults.forEach(function (result) {
        result.forEach(function(zipfile){
          let newZipProd  ={
            id:generateUUID(),
            path: zipfile.unzippedFilePath,
            type: ".pcap.gz"
          };
          unzipProds.push(newZipProd);
        });
      });

      let unzipStep = {
        id:generateUUID(),
        index:2,
        name:"Unzip",
        start:apdFile.startTime,
        end:apdFile.endTime,
        result:"Success",
        source:unzipSrc,
        products:unzipProds
      };

      fileInfo.flows[0].steps.push(unzipStep);

      //TODO
      // //Build mergeStep
      let mergeSrc = {
        id:generateUUID(),
        path: 'xx',
        type: ".pcap"
      };
      let mergeProds  =[{
        id:generateUUID(),
        path: apdFile.mergePcapFilesResult.mergedPcapFile,
        type: ".pcap"
      }];

      let mergeStep = {
        id:generateUUID(),
        index:3,
        name:"Mergecap",
        start:apdFile.startTime,
        end:apdFile.endTime,
        result:"Success",
        source:mergeSrc,
        products:mergeProds
      };

      fileInfo.flows[0].steps.push(mergeStep);

      file.updateAttributes(fileInfo,function(err,file){
        if (err || !file) {
          let e = err;
        }
        delete stateMap[apdFile.tag.fileID];
        let x = stateMap;
      });
    })
  }



  function generateUUID(){
    let d = new Date().getTime();

    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  }
*/
};
