/*
  MACD - DJM 31/12/2013
  (updated a couple of times since, check git history)

  Calculation:

  MACD Line: (12-day EMA - 26-day EMA)

  Signal Line: 9-day EMA of MACD Line

  MACD Histogram: MACD Line - Signal Line
 */

// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  // keep state about the current trend
  // here, on every new candle we use this
  // state object to check if we need to
  // report it.
  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  // how many candles do we need as a base
  // before we can start giving advice?
  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('macd', 'MACD', this.settings);
}

// what happens on every new candle?
method.update = function(candle) {
  // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
  var digits = 8;
  var macd = this.indicators.macd;

  var diff = macd.diff;
  var signal = macd.signal.result;

  log.debug('calculated MACD properties for candle:');
  log.debug('\t', 'short:', macd.short.result.toFixed(digits));
  log.debug('\t', 'long:', macd.long.result.toFixed(digits));
  log.debug('\t', 'macd:', diff.toFixed(digits));
  log.debug('\t', 'signal:', signal.toFixed(digits));
  log.debug('\t', 'macdiff:', macd.result.toFixed(digits));
}

method.check = function() {}

module.exports = method;
