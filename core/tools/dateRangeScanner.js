var async = require('async');

var util = require('../util');
var config = util.getConfig();
var dirs = util.dirs();
var log = require(dirs.core + 'log');

var adapter = config[config.adapter];
var Reader = require(dirs.gekko + adapter.path + '/reader');

var reader = new Reader();

// todo: rewrite with generators or async/await..
var scan = function(done) {
  log.info('Scanning local history for backtestable dateranges.');

  reader.tableExists('candles', (err, exists) => {
    if(err)
    return done(err, null, reader);

  if(!exists)
    return done(null, [], reader);

  async.parallel({
    boundry: reader.getBoundry,
    available: reader.countTotal
  }, (err, res) => {
      var first = res.boundry.first;
      var last = res.boundry.last;

      var optimal = (last - first) / 60;

      log.debug('Available', res.available);
      log.debug('Optimal', optimal);
  });

  });
}

module.exports = scan;
