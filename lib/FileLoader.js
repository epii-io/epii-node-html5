/* eslint-disable class-methods-use-this, no-param-reassign */

const fs = require('fs');
const path = require('path');
const util = require('util');
const Loader = require('./Loader.js');

const readFile = util.promisify(fs.readFile);

class FileLoader extends Loader {
  /**
   * constructor
   *
   * @param  {Object=} options - { prefix: String, source: String }
   * @constructor
   */
  constructor(options) {
    let o = options;
    if (!o || typeof o !== 'object') {
      o = { prefix: '/', source: '' };
    }
    if (typeof o.prefix !== 'string') o.prefix = '';
    if (o.prefix[0] !== '/') o.prefix = '/' + o.prefix;
    if (typeof o.source !== 'string') o.source = '';

    super(o);
    this.prefix = o.prefix;
    this.source = o.source;
  }

  match(asset) {
    // mount absolute path by others
    if (asset.getScheme()) return false;
    return true;
  }

  async mount(asset) {
    if (asset.mounted) return;
    if (asset.getScheme()) return;
    if (asset.inline) {
      // for inline mode
      if (asset.raw && !asset.src) {
        asset.mounted = true;
        return;
      }
      const src = path.join(this.source || '', asset.src);
      await readFile(src, asset.getEncoding())
        .then((content) => {
          asset.raw = content;
          asset.mounted = true;
        })
        .catch((error) => {
          console.error(error);
          asset.raw = asset.getComment('file system error');
        });
    } else {
      // for non-inline mode
      asset.src = path.join(this.prefix || '/', asset.src);
      asset.mounted = true;
    }
  }
}

module.exports = FileLoader;
