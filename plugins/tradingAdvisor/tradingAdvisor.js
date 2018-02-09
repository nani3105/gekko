var util = require('../../core/util');
var _ = require('lodash');
var fs = require('fs');
// var toml = require('toml');

var config = util.getConfig();
var dirs = util.dirs();
var log = require(dirs.core + 'log');
var CandleBatcher = require(dirs.core + 'candleBatcher');

var Actor = function(done) {
  _.bindAll(this);

  this.done = done;

  this.batcher = new CandleBatcher(config.tradingAdvisor.candleSize);

  this.methodName = config.tradingAdvisor.method;

  this.setupTradingMethod();
}

Actor.prototype.setupTradingMethod = function() {

  if(!fs.existsSync(dirs.methods + this.methodName + '.js'))
    util.die('Gekko can\'t find the strategy "' + this.methodName + '"');

  log.info('\t', 'Using the strategy: ' + this.methodName);

  var method = require(dirs.methods + this.methodName);

  // bind all trading method specific functions
  // to the Consultant.
  var Consultant = require('./baseTradingMethod');

  _.each(method, function(fn, name) {
    Consultant.prototype[name] = fn;
  });

  if(config[this.methodName]) {
    var tradingSettings = config[this.methodName];
  }

  this.method = new Consultant(tradingSettings);
  this.method
    .on('advice', this.relayAdvice);

  this.method
    .on('trade', this.processTrade);

  this.batcher
    .on('candle', this.processCustomCandle);
}


module.exports = Actor;
