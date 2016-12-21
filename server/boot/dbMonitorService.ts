import kernel from '../inversify.config';
import {VitaTasks} from "firmament-vita/js/interfaces/vita-tasks";
import {FullPipeline} from "firmament-vita/js/interfaces/vita-options-results";

var request = require('request');
var config = require('../config.json');
const path = require('path');

module.exports = function (app) {
  let etlTask = app.models.EtlTask;
  let etlFile = app.models.EtlFile;

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

    etlFile.findById(updFile.tag.fileID, function (err, file) {
      if (err || !file) {
        var x = err;
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
          var e = err;
        }
      });
    })
  }

  function appendEtlResults(apdFile) {
    let etlFile = app.models.EtlFile;

    etlFile.findById(apdFile.tag.fileID, function (err, file) {
      if (err || !file) {
        var x = err;
        return;
      }
      let fileInfo = file;
      fileInfo.lastStatus = apdFile.status;

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
      // fileInfo.flows[0].steps.push(unzipStep);

      //TODO
      // //Build mergeStep
      // fileInfo.flows[0].steps.push(mergeStep);

      file.updateAttributes(fileInfo,function(err,file){
        if (err || !file) {
          var e = err;
        }
      });
    })
  }



  function generateUUID(){
    var d = new Date().getTime();

    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

};
