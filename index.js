const renderer = require('./lib/renderer.js');
const AssetRef = require('./lib/AssetRef.js');
const ViewMeta = require('./lib/ViewMeta.js');
const MetaPack = require('./lib/MetaPack.js');

module.exports = {
  renderToString: renderer.renderToString,
  AssetRef,
  ViewMeta,
  MetaPack
};
