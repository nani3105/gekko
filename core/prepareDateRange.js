

var util = require('./util');
var config = util.getConfig();
var dirs = util.dirs();
var log = require(dirs.core + 'log');

var scan = require(dirs.tools + 'dateRangeScanner');

module.exports = function(done) {
  scan(() => {
    return done();
  });
}
