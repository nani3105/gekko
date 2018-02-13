/*
  MACD - DJM 31/12/2013
  (updated a couple of times since, check git history)
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

method.check = function() {}

module.exports = method;
