const moment = require('moment');
const _ = require('lodash');
const marketData = require('./binance-markets.json');

const util = require('../core/util');
const Errors = require('../core/error');
const log = require('../core/log');

const Binance = require('binance');

var Trader = function(config) {
    _.bindAll(this);

    if (_.isObject(config)) {
      this.key = config.key;
      this.secret = config.secret;
      this.currency = config.currency.toUpperCase();
      this.asset = config.asset.toUpperCase();
    }

    this.pair = this.asset + this.currency;
    this.name = 'binance';

    this.binance = new Binance.BinanceRest({
      key: this.key,
      secret: this.secret,
      timeout: 15000,
      recvWindow: 60000, // suggested by binance
      disableBeautification: false
    });

    // Binance has tight timing requirements, this will ask their server for the time and store
    // a drift value so we can calculate the most accurate timestamp possible form our system time
    this.binance.startTimeSync();
};

var retryForever = {
  forever: true,
  factor: 1.2,
  minTimeout: 10 * 1000,
  maxTimeout: 30 * 1000
};

var recoverableErrors = new RegExp(/(SOCKETTIMEDOUT|TIMEDOUT|CONNRESET|CONNREFUSED|NOTFOUND|Error -1021|Response code 429|Response code 5)/);

Trader.prototype.processError = function(funcName, error) {
  if (!error) return undefined;

  if (!error.message || !error.message.match(recoverableErrors)) {
    log.error(`[binance.js] (${funcName}) returned an irrecoverable error: ${error}`);
    return new Errors.AbortError('[binance.js] ' + error.message || error);
  }

  log.debug(`[binance.js] (${funcName}) returned an error, retrying: ${error}`);
  return new Errors.RetryError('[binance.js] ' + error.message || error);
};

Trader.prototype.handleResponse = function(funcName, callback) {
  return (error, body) => {
    if (body && !_.isEmpty(body.code)) {
      error = new Error(`Error ${body.code}: ${body.msg}`);
    }

    return callback(this.processError(funcName, error), body);
  }
};

Trader.prototype.getTrades = function(since, callback, descending) {
  var processResults = function(err, data) {
    if (err) return callback(err);

    var parsedTrades = [];
    _.each(
      data,
      function(trade) {
        parsedTrades.push({
          tid: trade.aggTradeId,
          date: moment(trade.timestamp).unix(),
          price: parseFloat(trade.price),
          amount: parseFloat(trade.quantity),
        });
      },
      this
    );

    if (descending) callback(null, parsedTrades.reverse());
    else callback(undefined, parsedTrades);
  };

  var reqData = {
    symbol: this.pair,
  };

  if (since) {
    var endTs = moment(since)
      .add(1, 'h')
      .valueOf();
    var nowTs = moment().valueOf();

    reqData.startTime = moment(since).valueOf();
    reqData.endTime = endTs > nowTs ? nowTs : endTs;
  }


  let handler = (cb) => this.binance.aggTrades(reqData, this.handleResponse('getTrades', cb));
  util.retryCustom(retryForever, _.bind(handler, this), _.bind(processResults, this));
}

Trader.getCapabilities = function() {
  return {
    name: 'Binance',
    slug: 'binance',
    currencies: marketData.currencies,
    assets: marketData.assets,
    markets: marketData.markets,
    requires: ['key', 'secret'],
    providesHistory: 'date',
    providesFullHistory: true,
    tid: 'tid',
    tradable: true,
  };
};


module.exports = Trader;
