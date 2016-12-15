import kernel from '../inversify.config';
import {VitaTasks} from "firmament-vita/js/interfaces/vita-tasks";
import {FullPipeline} from "firmament-vita/js/interfaces/vita-options-results";
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

          fullPipeline.decryptAndUnTarOptions.encryptedFiles = [path.resolve(file.path, file.name)];
          fullPipeline.decryptAndUnTarOptions.password = 'Ag4<R-byN1;B.58';
          fullPipeline.mergePcapFilesOptions.mergedPcapFile = 'moribund.pcap';

          vitaTasks.processFullPipelineInstance(fullPipeline, (err, result) => {
            let e = err;
          });
        });
      }
    });
  });
};
