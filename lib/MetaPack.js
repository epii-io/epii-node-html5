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
   * get view meta
   *
   * @param  {String} file
   * @return {ViewMeta}
   */
  getViewMeta(file) {
    return this.metas.get(file)
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
    var view = new ViewMeta(require(file), opts || this.opts)
    if (view.base) {
      var base = this.metas.get(view.base)
      if (!base && this.opts.locate) {
        var basePath = this.opts.locate(view.base)
        if (basePath === file) {
          throw new Error('view cannot inherit from self')
        }
        base = this.loadViewMeta(basePath)
      }
      view = view.merge(base)
    }
    this.metas.set(view.name || file, view)
    return view
  }
}

module.exports = MetaPack
