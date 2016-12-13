var request = require('request');

module.exports = function (app) {
  var me = this;
  var etlTask = app.models.EtlTask;
  var etlFile = app.models.EtlFile;
  var etlFlow = app.models.EtlFlow;

  etlTask.createChangeStream(function (err, changes) {
    changes.on('data', function (change) {
      if (change.type === "create") {
        etlFile.findById(change.data.fileId.toString(), function (err, obj) {
          if (err || !obj) {
            return;
          }
          var file = obj;
          me.getFlowInfo(file,change.data.flowId.toString());
        });
      }
    });
  });

  me.getFlowInfo = function (file,flowId) {
    etlFlow.findById(flowId, function (err, obj) {
      if (err || !obj) {
        return;
      }
      var flow = obj;
      me.buildFirmJSON(file,flow);
    });
  };

  me.buildFirmJSON = function (file,flow){


    var x = file;
    var y = flow;
    var z = 1;
  }
};
