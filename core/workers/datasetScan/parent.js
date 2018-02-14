var util = require('../../util');
var dirs = util.dirs();

module.exports = function(config, done) {

  util.setConfig(config);

  var adapter = config[config.adapter];
  var scan = require(dirs.gekko + adapter.path + '/scanner');

  scan(() => {});

}
