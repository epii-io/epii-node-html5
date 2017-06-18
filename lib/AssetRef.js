'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const MIMES = require('./_mimes.json')

/**
 * terminate function
 *
 * @param  {*} fn
 * @return {*}
 */
function terminate(fn) {
  return typeof fn !== 'function' ? fn : terminate(fn())
}

/**
 * get MIME by file name
 *
 * @param  {String} file
 * @return {String}
 */
function getFileMIME(file) {
  var idx = file.lastIndexOf('.')
  var ext = idx > -1 ? file.slice(idx) : null
  if (ext) ext = ext.toLowerCase().substring(1)
  return MIMES[ext] || MIMES.txt
}

/**
 * class ChainError
 */
class ChainError extends Error {
  constructor() {
    super()
  }
}

/**
 * class AssetRef
 */
class AssetRef {
  constructor(data) {
    var type = typeof data
    if (type === 'string') {
      this.src = data
      this.type = getFileMIME(data)
      this.source = null
      this.inline = false
    } else if (type === 'object') {
      this.src = data.src || ''
      this.type = data.type || getFileMIME(this.src)
      this.source = data.source || null
      this.inline = data.inline || false
    } else if (type === 'function') {
      return new AssetRef(terminate(data))
    } else {
      throw new Error('invalid asset')
    }
  }

  /**
   * get src schema
   *
   * @return {String}
   */
  getSchema() {
    var idx = this.src.indexOf('//')
    if (idx < 0) return ''
    var head = this.src.slice(0, idx)
    return /^[a-z]+[a-z0-9+-.]*:$/.test(head)
      ? head.slice(0, head.length - 1) : 'https'
  }

  /**
   * get encoding
   *
   * @return {String}
   */
  getEncoding() {
    if (/^text|(javascript|json)$/.test(this.type)) {
      // utf-8 for document
      return 'utf8'
    }
    // return nothing works well for raw
    // NEVER return explicit buffer/binary
    // fs API use null for raw buffer
    // child_process API use null for smart type
    //  => utf8 for text & MAYBE raw buffer for raw
  }

  /**
   * get error comment
   *
   * @param  {String} error
   * @return {String}
   */
  getComment(error) {
    var comment = error || 'error'
    switch (this.type) {
    case 'text/html': return `<!-- epii:${comment} -->`
    case 'text/css': return `/* epii:${comment} */`
    case 'application/javascript': return `// epii:${comment}`
    default: return comment
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
      var content = loader(this, query)
      return content instanceof Promise
        ? content : Promise.resolve(content)
    } catch (error) {
      return Promise.reject(error)
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
    var result = typeof loader === 'function'
      ? this.applyLoader(loader, query) : Promise.reject()
    return result.catch(error => {
      if (error && !(error instanceof ChainError)) {
        return this.getComment('custom loader error')
      }
      if (!this.src && this.source) return this.source
      if (this.getSchema()) {
        return this.getComment('loader required')
      }
      if (typeof loader === 'object') query = loader
      if (!query) query = {}
      if (!this.inline) {
        if (!this._oldSrc) this._oldSrc = this.src
        this.src = path.join(query.prefix || '/', this._oldSrc)
        return Promise.resolve(this.src)
      }
      return new Promise((resolve, reject) => {
        var fullSrc = path.join(query.source || '', this.src)
        fs.readFile(fullSrc, this.getEncoding(), (e, data) => {
          if (e) return resolve(this.getComment('file system error'))
          resolve(this.source = data)
        })
      })
    })
  }
}

AssetRef.ChainError = ChainError
module.exports = AssetRef
