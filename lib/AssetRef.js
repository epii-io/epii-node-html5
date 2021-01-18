/* global Promise */

const fs = require('fs');
const path = require('path');
const mime = require('mime');

/**
 * terminate function
 *
 * @param  {*} fn
 * @return {*}
 */
function terminate(fn) {
  return typeof fn !== 'function' ? fn : terminate(fn());
}

/**
 * get MIME by file name
 *
 * @param  {String} file
 * @return {String}
 */
function getFileMIME(file) {
  return mime.getType(file) || 'text/plain';
}

/**
 * class AssetRef
 */
class AssetRef {
  constructor(data) {
    const type = typeof data;
    if (type === 'string') {
      this.src = data;
      this.type = getFileMIME(data);
      this.source = null;
      this.inline = false;
    } else if (type === 'object') {
      this.src = data.src || '';
      this.type = data.type || getFileMIME(this.src);
      this.source = data.source || null;
      this.inline = data.inline || false;
    } else if (type === 'function') {
      return new AssetRef(terminate(data));
    } else {
      throw new Error('invalid asset');
    }
  }

  /**
   * get src scheme
   *
   * @return {String}
   */
  getScheme() {
    const idx = this.src.indexOf('//');
    if (idx < 0) return '';
    const head = this.src.slice(0, idx);
    return /^[a-z]+[a-z0-9+-.]*:$/.test(head)
      ? head.slice(0, head.length - 1) : 'https';
  }

  /**
   * get encoding
   *
   * @return {String}
   */
  getEncoding() {
    if (/^text|(javascript|json)$/.test(this.type)) {
      // utf-8 for document
      return 'utf8';
    }
    // return nothing works well for raw
    // NEVER return explicit buffer/binary
    // fs API use null for raw buffer
    // child_process API use null for smart type
    //  => utf8 for text & MAYBE raw buffer for raw
    return undefined;
  }

  /**
   * get error comment
   *
   * @param  {String} error
   * @return {String}
   */
  getComment(error) {
    const comment = error || 'error';
    switch (this.type) {
      case 'text/html': return `<!-- epii:${comment} -->`;
      case 'text/css': return `/* epii:${comment} */`;
      case 'application/javascript': return `// epii:${comment}`;
      default: return comment;
    }
  }

  /**
   * apply custom loader with query
   * maybe update src or source
   *
   * @param  {Function} loader - fn(asset, query)
   * @param  {Object} query
   * @return {Promise}
   */
  applyLoader(loader, query) {
    try {
      const content = loader(this, query);
      return content instanceof Promise ? content : Promise.resolve(content);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * apply loader
   *
   * @param  {Function=} loader - fn(asset, query)
   * @param  {Object=} query
   * @return {Promise} promise to load source
   */
  compute(loader, query) {
    const finalOutput = (error) => {
      if (error) {
        return this.getComment(error.message);
      }
      // or invoke default loader
      // output source
      if (!this.src && this.source) {
        return this.source;
      }
      // absolute uri must load by custom loader
      if (this.getScheme()) {
        return this.getComment('loader required');
      }
      // compute(query)
      let $query = query;
      if (typeof loader === 'object') $query = loader;
      if (!$query) $query = {};
      // for inline mode
      if (this.inline) {
        return new Promise((resolve) => {
          const fullSrc = path.join($query.source || '', this.src);
          fs.readFile(fullSrc, this.getEncoding(), (e, data) => {
            if (e) {
              resolve(this.getComment('file system error'));
            } else {
              resolve(this.source = data);
            }
          });
        });
      }
      // for non-inline mode
      if (!this.$oldSrc) this.$oldSrc = this.src;
      this.src = path.join($query.prefix || '/', this.$oldSrc);
      return this.src;
    };
    let result;
    // invoke custom loader at first
    if (typeof loader === 'function') {
      result = this.applyLoader(loader, query).catch(finalOutput);
    } else {
      result = Promise.resolve(finalOutput());
    }
    return result;
  }
}

module.exports = AssetRef;
