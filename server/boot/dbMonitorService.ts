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

  function updateEtlStatus(etlFile){
    let fileID = etlFile.tag.fileID;
    let flowID = etlFile.tag.flowID;

    // etlFile.findById(fileID, function (err, file) {
    //   if (err || !file) {
    //     var x = err;
    //   }
    //     return;
    //   }
    //
    //   let updatedFile = {};
    //
    //
    //   file.update(updatedFile, function (err, file) {
    //     if (err || !file) {
    //       var e = err;
    //     }
    //       return;
    //   });
  }

  function appendEtlResults(etlFile) {
    let fileID = etlFile.fileID;
    let flowID = etlFile.flowID;
    let flowLastStatus = "";

    let updatedFlow = app.models.EtlFlow;
    let decryptStep = app.models.EtlStep;
    let unzipStep = app.models.EtlStep;
    let mergeStep = app.models.EtlStep;

    //Build decryptStep
    let decryptSrc = {
      path: "",
      type: ".enc"
    };

    let decryptProds = [];
    etlFile.decrtypandUnTarResults.zipFiles.forEach(function (zipFile) {
      let newZip  ={
        path: zipFile,
        type: ".pcap.gz"
      };
      decryptProds.push(newZip)
    });

    decryptStep.index = 1;
    decryptStep.name = "Decrypt and Untar";
    decryptStep.start = "";
    decryptStep.end = "";
    decryptStep.result = "";
    decryptStep.source = decryptSrc;
    decryptStep.products = decryptProds;

    //Build unzipStep

    //Build mergeStep
    let mergeSrc = {
      path: "",
      type: ".pcap"
    };
    let mergeProds = [
      {
        path: "",
        type: ".pcap"
      }
    ];

    mergeStep.index = 3;
    mergeStep.name = "Merge pcaps";
    mergeStep.start = "";
    mergeStep.end = "";
    mergeStep.result = "";
    mergeStep.source = mergeSrc;
    mergeStep.products = decryptProds;

    updatedFlow = {
      id: flowID,
      name: "Bro",
      lastStatus:flowLastStatus,
      steps:[
        {
          decryptStep,
          unzipStep,
          mergeStep
        }
      ]
    };

    etlFile.findById(fileID, function (err, file) {
      if (err || !file) {
        return;
      }

      file.etlFlows.update(updatedFlow, function (err, flow) {
        if (err || !flow) {
          return;
        }
      })
    });

  }


};
