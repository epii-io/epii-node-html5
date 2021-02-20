const renderer = require('./lib/renderer.js');
const AssetRef = require('./lib/AssetRef.js');
const ViewMeta = require('./lib/ViewMeta.js');
const ViewPack = require('./lib/ViewPack.js');
const Loader = require('./lib/Loader.js');
const FileLoader = require('./lib/FileLoader.js');

module.exports = {
  renderToString: renderer.renderToString,
  AssetRef,
  ViewMeta,
  ViewPack,
  Loader,
  FileLoader,
};
