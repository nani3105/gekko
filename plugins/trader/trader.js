var _ = require('lodash');
var util = require('../../core/util.js');
var config = util.getConfig();
var dirs = util.dirs();

var log = require(dirs.core + 'log');


var Trader = function(next) {
  _.bindAll(this);


}

module.exports = Trader;
