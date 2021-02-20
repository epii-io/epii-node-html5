/* eslint-disable global-require */
const path = require('path');
const ViewMeta = require('./ViewMeta.js');

/**
 * class ViewMeta
 */
class ViewPack {
  constructor(root) {
    if (!root) throw new Error('root required');
    this.root = root;
    this.views = {};
    this.loaders = [];
  }

  /**
   * resolve meta name
   *
   * @param  {String} name
   * @return {String}
   */
  resolve(name) {
    switch (typeof this.root) {
      case 'function': return this.root(name);
      case 'string': return path.join(this.root, name);
      default: return '';
    }
  }

  /**
   * get view meta
   *
   * @param  {String} name
   * @return {ViewMeta}
   */
  getViewMeta(name) {
    return this.views[name];
  }

  /**
   * load view meta
   *
   * @param  {String} name
   * @return {ViewMeta}
   */
  loadViewMeta(name) {
    const viewPath = this.resolve(name);
    delete require.cache[viewPath];
    let view = new ViewMeta(require(viewPath));
    if (view.base) {
      if (view.base === name) {
        throw new Error('view cannot inherit from self');
      }
      let base = this.getViewMeta(view.base);
      if (!base) base = this.loadViewMeta(view.base);
      view = view.merge(base);
    }
    this.views[view.name || name] = view;
    return view;
  }

  /**
   * use loader for all views
   *
   * @param {*} loader
   * @param {Object=} options
   */
  useLoader(loader, options) {
    let LoaderClass = null;
    if (!loader) {
      console.warn('use default loader');
      LoaderClass = require('./FileLoader.js');
    }
    const type = typeof loader;
    if (type === 'function') {
      LoaderClass = loader;
    }
    if (type === 'string') {
      LoaderClass = require(loader);
    }
    if (LoaderClass) {
      this.loaders.unshift(new LoaderClass(options));
    }
  }
}

module.exports = ViewPack;
