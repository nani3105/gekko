var _ = require('lodash');
var util = require('../../core/util.js');
var log = require(`${util.dirs().core}log`);

var handle = require('./handle');
var mongoUtil = require('./util');

var Reader = function Reader () {
  _.bindAll(this);
  this.db = handle;
  this.collection = this.db.collection(mongoUtil.settings.historyCollection);
  this.pair = mongoUtil.settings.pair.join('_');
}

Reader.prototype.countTotal = function countTotal (next) {
  this.collection.count({ pair: this.pair }, (err, count) => {
    if (err) {
      return util.die('DB error at `countTotal`');
    }
    return next(null, count);
  })
}

Reader.prototype.getBoundry = function getBoundry (next) {
  this.collection.find({ pair: this.pair }, { start: 1 }).sort({ start: 1 }).limit(1, (err, docs) => {
    if (err) {
      return util.die('DB error at `getBoundry`');
    }
    var start = _.first(docs).start;

    this.collection.find({ pair: this.pair }, { start: 1 }).sort({ start: -1 }).limit(1, (err2, docs2) => {
      if (err2) {
        return util.die('DB error at `getBoundry`');
      }
      var end = _.first(docs2).start;
      return next(null, { first: start, last: end });
    });
    return null;
  });
}

Reader.prototype.tableExists = function(name, next) {
  return next(null, true); // Return true for backtest
}

module.exports = Reader;
