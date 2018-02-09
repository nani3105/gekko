var _ = require('lodash');
var fs = require('fs');
var util = require('./util');
var config = util.getConfig();
var dirs = util.dirs();

var Checker = function() {
  _.bindAll(this);
}

Checker.prototype.getExchangeCapabilities = function(slug) {
  var capabilities;

  if(!fs.existsSync(dirs.exchanges + slug + '.js'))
    util.die(`Gekko does not know exchange "${slug}"`);

  var Trader = require(dirs.exchanges + slug);
  capabilities = Trader.getCapabilities();

  return capabilities;
}

// check if the exchange is configured correctly for monitoring
Checker.prototype.cantMonitor = function(conf) {
  var slug = conf.exchange.toLowerCase();
  var exchange = this.getExchangeCapabilities(slug);

  if(!exchange)
    return 'Gekko does not support the exchange ' + slug;

  var name = exchange.name;

  if('monitorError' in exchange)
    return 'At this moment Gekko can\'t monitor ' + name +  ', find out more info here:\n\n' + exchange.monitorError;

  var name = exchange.name;

  if(!_.contains(exchange.currencies, conf.currency))
    return 'Gekko only supports the currencies [ ' + exchange.currencies.join(', ') + ' ] at ' + name + ' (not ' + conf.currency + ')';

  if(!_.contains(exchange.assets, conf.asset))
    return 'Gekko only supports the assets [ ' + exchange.assets.join(', ') + ' ]  at ' + name + ' (not ' + conf.asset + ')';

  var pair = _.find(exchange.markets, function(p) {
    return p.pair[0] === conf.currency && p.pair[1] === conf.asset;
  });

  if(!pair)
    return 'Gekko does not support this currency/assets pair at ' + name;

  // everyting okay
  return false;
}

Checker.prototype.settings = function(conf) {
  var slug = conf.exchange.toLowerCase();
  return this.getExchangeCapabilities(slug);

}

module.exports = new Checker();
