import kernel from '../inversify.config';
import {VitaTasks} from "firmament-vita/js/interfaces/vita-tasks";
import {FullPipeline} from "firmament-vita/js/interfaces/vita-options-results";
var request = require('request');
const path = require('path');

module.exports = function (app) {
  var etlTask = app.models.EtlTask;
  var etlFile = app.models.EtlFile;

  let vitaTasks: VitaTasks = kernel.get<VitaTasks>('VitaTasks');
  let fullPipeline: FullPipeline = kernel.get<FullPipeline>('FullPipeline');

  etlTask.createChangeStream(function (err, changes) {
    changes.on('data', function (change) {
      if (change.type === "create") {
        etlFile.findById(change.data.fileId.toString(), function (err, obj) {
          if (err || !obj) {
            return;
          }
          var file = obj;

          fullPipeline.decryptAndUnTarOptions.encryptedFiles = [path.resolve(file.path,file.name)];
          fullPipeline.decryptAndUnTarOptions.password = 'xxx';

          vitaTasks.processFullPipelineInstance(fullPipeline,(err,result)=>{
            let e = err;
          });

        });
      }
    });
  });

};
