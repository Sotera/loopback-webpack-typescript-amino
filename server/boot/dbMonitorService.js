"use strict";
const inversify_config_1 = require('../inversify.config');
var request = require('request');
const path = require('path');
module.exports = function (app) {
    var etlTask = app.models.EtlTask;
    var etlFile = app.models.EtlFile;
    let vitaTasks = inversify_config_1.default.get('VitaTasks');
    let fullPipeline = inversify_config_1.default.get('FullPipeline');
    etlTask.createChangeStream(function (err, changes) {
        changes.on('data', function (change) {
            if (change.type === "create") {
                etlFile.findById(change.data.fileId.toString(), function (err, obj) {
                    if (err || !obj) {
                        return;
                    }
                    var file = obj;
                    fullPipeline.decryptAndUnTarOptions.encryptedFiles = [path.resolve(file.path, file.name)];
                    fullPipeline.decryptAndUnTarOptions.password = 'xxx';
                    vitaTasks.processFullPipelineInstance(fullPipeline, (err, result) => {
                        let e = err;
                    });
                });
            }
        });
    });
};
//# sourceMappingURL=dbMonitorService.js.map