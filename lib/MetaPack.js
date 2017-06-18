'use strict'

const path = require('path')
const ViewMeta = require('./ViewMeta.js')

/**
 * class ViewMeta
 */
class MetaPack {
  constructor(root, opts) {
    if (!root) throw new Error('invalid root')
    this.root = root
    this.opts = opts
    this.metas = new Map()
  }

  /**
   * resolve meta name
   *
   * @param  {String} name
   * @return {String}
   */
  resolve(name) {
    switch (typeof this.root) {
    case 'function': return this.root(name)
    case 'string': return path.join(this.root, name)
    default: return ''
    }
  }

  /**
   * get view meta
   *
   * @param  {String} name
   * @return {ViewMeta}
   */
  getViewMeta(name) {
    return this.metas.get(name)
  }

  /**
   * load view meta
   *
   * @param  {String} name
   * @param  {Object=} opts
   * @return {ViewMeta}
   */
  loadViewMeta(name, opts) {
    var viewPath = this.resolve(name)
    delete require.cache[viewPath]
    var view = new ViewMeta(require(viewPath), opts || this.opts)
    if (view.base) {
      if (view.base === name) throw new Error('view cannot inherit from self')
      var base = this.getViewMeta(view.base)
      if (!base) base = this.loadViewMeta(view.base)
      view = view.merge(base)
    }
    this.metas.set(view.name || name, view)
    return view
  }
}

module.exports = MetaPack
