'use strict';
var async = require('async');
var log = require('debug')('boot:01-populate-db');

module.exports = function (app) {
  app.models.EtlFlow.getDataSource().setMaxListeners(0);
  var EtlFlow = app.models.EtlFlow;

  var defaultFlows = [
    {
      id:'582c9ed90dcb247b333fb1d6',
      name:'Bro'
    }
  ];

  async.parallel([
      createDefaultFlows
    ], function (err, result) {
      if (err) {
        log(err);
        return;
      }
      var createdDefaultFlows = result[0];
    }
  );

  function createDefaultFlows(cb){
    var functionArray = [];
    defaultFlows.forEach(function (flow) {
      functionArray.push(async.apply(findOrCreateObj, EtlFlow, {where: {name: flow.name}},flow));
    });
    async.parallel(functionArray, cb);
  }

  function findOrCreateObj(model, query, objToCreate, cb) {
    try {
      model.findOrCreate(
        query,
        objToCreate, // create
        function (err, createdObj) {
          if (err) {
            log(err);
          }
          cb(err, createdObj);
        });
    } catch (err) {
      log(err);
    }
  }
};
