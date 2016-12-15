"use strict";
const inversify_config_1 = require('../inversify.config');
const path = require('path');
module.exports = function (app) {
    let etlTask = app.models.EtlTask;
    let etlFile = app.models.EtlFile;
    let vitaTasks = inversify_config_1.default.get('VitaTasks');
    let fullPipeline = inversify_config_1.default.get('FullPipeline');
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
//# sourceMappingURL=dbMonitorService.js.map