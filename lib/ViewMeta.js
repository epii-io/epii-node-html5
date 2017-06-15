'use strict'

const fs = require('fs')
const path = require('path')
const sanitize = require('./sanitize.js')
const AssetRef = require('./AssetRef.js')

/**
 * convert any object to array
 *
 * @param  {*=} o
 * @return {*[]}
 */
function arrayify(o) {
  if (o == null) return []
  return Array.isArray(o) ? o : [o]
}

/**
 * class ViewMeta
 *  - name: String
 *  - base: String
 *  - html: String
 *  - head
 *    |- icon: AssetRef = (link)
 *    |- title: String
 *    |- metas: Object[]
 *    |- styles: AssetRef[] = (style)
 *    |- scripts: AssetRef[] = (script)
 *  - body
 *    |- holder: String (resolved)
 *    |-> injectA: AssetRef[] = (script)
 *        |- state: AssetRef = (script)
 *    |- scripts: AssetRef[] = (script)
 *    |-> injectB: AssetRef[] = (script)
 *        |- launch: AssetRef = (script)
 */
class ViewMeta {
  /**
   * constructor
   *
   * @param  {Object=} meta
   * @param  {Object=} opts - { prefix: String, source: String }
   * @constructor
   */
  constructor(meta, opts) {
    this.opts = ViewMeta.getOpts(opts)
    if (!meta || typeof meta !== 'object') {
      this.head = this.getHead()
      this.body = this.getBody()
    } else {
      this.name = meta.name
      if (meta.html) {
        this.html = new AssetRef(meta.html)
        this.html.inline = true
      } else {
        this.base = meta.base
        this.head = this.getHead(meta.head)
        this.body = this.getBody(meta.body)
      }
    }
  }

  /**
   * get opts
   *
   * @param  {Object=} opts
   * @return {Object}
   */
  static getOpts(opts) {
    if (!opts || typeof opts !== 'object') {
      return { prefix: '/', source: '' }
    }
    if (typeof opts.prefix !== 'string') opts.prefix = ''
    if (opts.prefix[0] !== '/') opts.prefix = '/' + opts.prefix
    if (typeof opts.source !== 'string') opts.source = ''
    return opts
  }

  /**
   * get head
   *
   * @param  {Object=} head
   * @return {Object}
   */
  getHead(head) {
    if (head) {
      return {
        title: head.title || '',
        metas: arrayify(head.metas),
        icon: head.icon ? new AssetRef(head.icon) : null,
        styles: arrayify(head.styles).map(e => new AssetRef(e)),
        scripts: arrayify(head.scripts).map(e => new AssetRef(e))
      }
    }
    return {
      title: '', metas: [],
      icon: null, styles: [], scripts: []
    }
  }

  /**
   * get body
   *
   * @param  {Object=} body
   * @return {Object}
   */
  getBody(body) {
    if (body) {
      if (body.holder) {
        body.holder.inline = true
        body.holder.type = 'text/html'
      }
      return {
        holder: body.holder ? new AssetRef(body.holder) : null,
        scripts: arrayify(body.scripts).map(e => new AssetRef(e)),
        injectA: [],
        injectB: body.launch ? [new AssetRef(body.launch)] : []
      }
    }
    return {
      holder: null, scripts: [], injectA: [], injectB: []
    }
  }

  /**
   * merge meta and self into new meta
   * self priority
   *
   * @param  {ViewMeta} meta
   * @return {ViewMeta}
   */
  merge(meta) {
    if (!(meta instanceof ViewMeta)) return this
    var newMeta = new ViewMeta()
    if (this.html) newMeta.html = this.html
    else {
      if (meta.head) {
        newMeta.head.title = this.head.title || meta.head.title
        newMeta.head.metas = this.head.metas.concat(meta.head.metas)
        newMeta.head.icon = this.head.icon || meta.head.icon
        newMeta.head.styles = this.head.styles.concat(meta.head.styles)
        newMeta.head.scripts = this.head.scripts.concat(meta.head.scripts)
      }
      if (meta.body) {
        newMeta.body.holder = this.body.holder || meta.body.holder
        newMeta.body.scripts = this.body.scripts.concat(meta.body.scripts)
        newMeta.body.injectA = this.body.injectA
        newMeta.body.injectB = this.body.injectB.concat(meta.body.injectB)
      }
    }
    return newMeta
  }

  /**
   * fill inline source
   * fill state into meta
   *
   * @param  {Object=} state
   * @param  {Function=} loader - fn(asset, query):Promise
   */
  async mount(state, loader) {
    if (typeof state === 'function') {
      throw new Error('state function not support')
    }

    // fill html
    if (this.html) {
      await this.html.compute(loader, this.opts)
      return console.error('!! epii warn !! use html in meta')
    }

    var tasks = []
    // fill holder
    if (this.body.holder) {
      tasks.push(this.body.holder.compute(loader, this.opts))
    }

    // fill other assets
    var compute = e => e.compute(loader, this.opts)
    tasks = tasks.concat(
      this.head.styles.map(compute),
      this.head.scripts.map(compute),
      this.body.scripts.map(compute),
      this.body.injectB.map(compute)
    )
    var result = await Promise.all(tasks)

    // fill state
    if (!state) state = {}
    var stateJSON = sanitize(JSON.stringify(state))
    this.body.injectA = [new AssetRef({
      source: `window.epii={state:${stateJSON}};`,
      type: 'application/javascript',
      inline: true
    })]
  }
}

module.exports = ViewMeta
