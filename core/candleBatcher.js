// internally we only use 1m
// candles, this can easily
// convert them to any desired
// size.

// Acts as ~fake~ stream: takes
// 1m candles as input and emits
// bigger candles.
//
// input are transported candles.

var _ = require('lodash');
var util = require(__dirname + '/util');

var CandleBatcher = function(candleSize) {
  if(!_.isNumber(candleSize))
    throw 'candleSize is not a number';

  this.candleSize = candleSize;
  this.smallCandles = [];

  _.bindAll(this);
}

module.exports = CandleBatcher;
