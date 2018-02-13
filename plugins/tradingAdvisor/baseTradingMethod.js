var _ = require('lodash');
var fs = require('fs');
var util = require('../../core/util');
var config = util.getConfig();
var dirs = util.dirs();
var log = require(dirs.core + 'log');

var ENV = util.gekkoEnv();
var mode = util.gekkoMode();
var startTime = util.getStartTime();

var talib = require(dirs.core + 'talib');
if(talib == null) {
  log.warn('TALIB indicators could not be loaded, they will be unavailable.');
}

var tulind = require(dirs.core + 'tulind');
if(tulind == null) {
  log.warn('TULIP indicators could not be loaded, they will be unavailable.');
}

var indicatorsPath = dirs.methods + 'indicators/';
var indicatorFiles = fs.readdirSync(indicatorsPath);
var Indicators = {};

_.each(indicatorFiles, function(indicator) {
  const indicatorName = indicator.split(".")[0];
  if (indicatorName[0] != "_")
    try {
      Indicators[indicatorName] = require(indicatorsPath + indicator);
    } catch (e) {
      log.error("Failed to load indicator", indicatorName);
    }
});

var allowedIndicators = _.keys(Indicators);
var allowedTalibIndicators = _.keys(talib);
var allowedTulipIndicators = _.keys(tulind);

var Base = function(settings) {
  _.bindAll(this);

  this.setup = false;
  this.settings = settings;
  this.tradingAdvisor = config.tradingAdvisor;
  this.indicators = {};
  this.talibIndicators = {};
  this.tulipIndicators = {};

  // make sure we have all methods
  _.each(['init', 'check'], function(fn) {
    if(!this[fn])
      util.die('No ' + fn + ' function in this trading method found.')
  }, this);

  if(!this.update)
    this.update = function() {};

  if(!this.end)
    this.end = function() {};

  if(!this.onTrade)
    this.onTrade = function() {};

  // let's run the implemented starting point
  this.init();

  if(!config.debug || !this.log)
    this.log = function() {};

  this.setup = true;

  if(_.size(this.talibIndicators) || _.size(this.tulipIndicators))
    this.asyncTick = true;

  if(_.size(this.indicators))
    this.hasSyncIndicators = true;
}

// teach our base trading method events
util.makeEventEmitter(Base);

Base.prototype.tick = function(candle) {

  if(
    this.asyncTick &&
    this.hasSyncIndicators &&
    this.age !== this.processedTicks
  ) {
    // Gekko will call talib and run strat
    // functions when talib is done, but by
    // this time the sync indicators might be
    // updated with future candles.
    //
    // See @link: https://github.com/askmike/gekko/issues/837#issuecomment-316549691
    return this.deferredTicks.push(candle);
  }

  this.age++;

  if(this.asyncTick) {
    this.candleProps.open.push(candle.open);
    this.candleProps.high.push(candle.high);
    this.candleProps.low.push(candle.low);
    this.candleProps.close.push(candle.close);
    this.candleProps.volume.push(candle.volume);
    this.candleProps.vwp.push(candle.vwp);
    this.candleProps.trades.push(candle.trades);

    if(this.age > this.candlePropsCacheSize) {
      this.candleProps.open.shift();
      this.candleProps.high.shift();
      this.candleProps.low.shift();
      this.candleProps.close.shift();
      this.candleProps.volume.shift();
      this.candleProps.vwp.shift();
      this.candleProps.trades.shift();
    }
  }

  // update all indicators
  var price = candle[this.priceValue];
  _.each(this.indicators, function(i) {
    if(i.input === 'price')
      i.update(price);
    if(i.input === 'candle')
      i.update(candle);
  },this);

  // update the trading method
  if(!this.asyncTick) {
    this.propogateTick(candle);
  } else {

    var next = _.after(
      _.size(this.talibIndicators) + _.size(this.tulipIndicators),
      () => this.propogateTick(candle)
    );

    var basectx = this;
  }

}

Base.prototype.addIndicator = function(name, type, parameters) {
  if(!_.contains(allowedIndicators, type))
    util.die('I do not know the indicator ' + type);

  if(this.setup)
    util.die('Can only add indicators in the init method!');

  this.indicators[name] = new Indicators[type](parameters);

  // some indicators need a price stream, others need full candles
}


module.exports = Base;
