// All plugins supported by Gekko.
//
//  Required parameters per plugin.
//
// name: Name of the plugin
// slug: name of the plugin mapped to the config key. Expected
//    filename to exist in `gekko/plugins/` (only if path is not
//    specified)
// async: upon creating a new plugin instance, does something async
//    happen where Gekko needs to wait for? If set to true, the
//    constructor will be passed a callback which it should execute
//    as soon as Gekko can continue.
// modes: a list indicating in what Gekko modes this plugin is
//    allowed to run. Realtime is during a live market watch and
//    backtest is during a backtest.
//
//  Optional parameters per plugin.
//
// description: text describing the plugin.
// dependencies: a list of external npm modules this plugin requires to
//    be installed.
// emits: events emitted by this plugin that other plugins can subscribe to.
// path: fn that returns path of file of the plugin (overwrites `gekko/plugins/{slug}`)
//    when given the configuration object (relative from `gekko/plugins/`).
var plugins = [
  {
    name: 'Candle writer',
    description: 'Store candles in a database',
    slug: 'candleWriter',
    async: true,
    modes: ['realtime', 'importer'],
    path: config => config.adapter + '/writer',
    version: 0.1,
  },
  {
    name: 'Trading Advisor',
    description: 'Calculate trading advice',
    slug: 'tradingAdvisor',
    async: true,
    modes: ['realtime', 'backtest'],
    emits: ['advice'],
    path: config => 'tradingAdvisor/tradingAdvisor.js',
  },
  {
    name: 'Paper Trader',
    description: 'Paper trader that simulates fake trades.',
    slug: 'paperTrader',
    async: false,
    modes: ['realtime', 'backtest'],
    emits: ['portfolioUpdate', 'trade'],
    path: config => 'paperTrader/paperTrader.js',
  },
];

  module.exports = plugins;
