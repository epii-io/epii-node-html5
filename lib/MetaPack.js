'use strict'

const ViewMeta = require('./ViewMeta.js')

/**
 * class ViewMeta
 */
class MetaPack {
  constructor(opts) {
    this.opts = opts
    this.metas = new Map()
  }

  /**
   * load view meta
   *
   * @param  {String} file
   * @param  {Object=} opts
   * @return {ViewMeta}
   */
  loadViewMeta(file, opts) {
    delete require.cache[file]
    var meta = new ViewMeta(require(file), opts || this.opts)
    if (meta.base) meta = meta.merge(this.metas.get(meta.base))
    if (meta.name) this.metas.set(meta.name, meta)
    return meta
  }
}

module.exports = MetaPack
