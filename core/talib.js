// validate that talib is installed, if not we'll throw an excepion which will
// prevent further loading or out outside this module
try {
  var talib = require("talib");
} catch (e) {
  module.exports = null;
  return;
}
