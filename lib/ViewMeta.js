/* global Promise */

const sanitize = require('./sanitize.js');
const AssetRef = require('./AssetRef.js');

/**
 * convert any object to array
 *
 * @param  {*=} o
 * @return {*[]}
 */
function arrayify(o) {
  if (o == null) return [];
  return Array.isArray(o) ? o : [o];
}

/**
 * get head
 *
 * @param  {Object=} head
 * @return {Object}
 */
function getHead(head) {
  if (head) {
    return {
      title: head.title || '',
      metas: arrayify(head.metas),
      icon: head.icon ? new AssetRef(head.icon) : null,
      styles: arrayify(head.styles).map(e => new AssetRef(e)),
      scripts: arrayify(head.scripts).map(e => new AssetRef(e))
    };
  }
  return {
    title: '',
    metas: [],
    icon: null,
    styles: [],
    scripts: []
  };
}

/**
 * get body
 *
 * @param  {Object=} body
 * @return {Object}
 */
function getBody(body) {
  if (body) {
    let holder = body.holder;
    if (holder) {
      holder = new AssetRef(body.holder);
      holder.inline = true;
      holder.type = 'text/html';
    }
    return {
      holder,
      scripts: arrayify(body.scripts).map(e => new AssetRef(e)),
      injectA: [],
      injectB: body.launch ? [new AssetRef(body.launch)] : []
    };
  }
  return {
    holder: null, scripts: [], injectA: [], injectB: []
  };
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
    this.opts = ViewMeta.getOpts(opts);
    if (!meta || typeof meta !== 'object') {
      this.head = getHead();
      this.body = getBody();
    } else {
      this.name = meta.name;
      if (meta.html) {
        this.html = new AssetRef(meta.html);
        this.html.inline = true;
      } else {
        this.base = meta.base;
        this.head = getHead(meta.head);
        this.body = getBody(meta.body);
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
    const options = opts;
    if (!options || typeof options !== 'object') {
      return { prefix: '/', source: '' };
    }
    if (typeof options.prefix !== 'string') options.prefix = '';
    if (options.prefix[0] !== '/') options.prefix = '/' + options.prefix;
    if (typeof options.source !== 'string') options.source = '';
    return options;
  }

  /**
   * merge meta and self into new meta
   * self priority
   *
   * @param  {ViewMeta} meta
   * @return {ViewMeta}
   */
  merge(meta) {
    if (!(meta instanceof ViewMeta)) return this;
    const newMeta = new ViewMeta();
    if (this.html) newMeta.html = this.html;
    else {
      if (meta.head) {
        newMeta.head.title = this.head.title || meta.head.title;
        newMeta.head.metas = meta.head.metas.concat(this.head.metas);
        newMeta.head.icon = this.head.icon || meta.head.icon;
        newMeta.head.styles = meta.head.styles.concat(this.head.styles);
        newMeta.head.scripts = meta.head.scripts.concat(this.head.scripts);
      }
      if (meta.body) {
        newMeta.body.holder = this.body.holder || meta.body.holder;
        newMeta.body.scripts = meta.body.scripts.concat(this.body.scripts);
        newMeta.body.injectA = this.body.injectA;
        newMeta.body.injectB = meta.body.injectB.concat(this.body.injectB);
      }
    }
    newMeta.opts = this.opts || meta.opts;
    return newMeta;
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
      throw new Error('state function not support');
    }

    // fill html
    if (this.html) {
      await this.html.compute(loader, this.opts);
      console.error('!! epii warn !! use html in meta');
      return;
    }

    let tasks = [];
    const compute = e => e.compute(loader, this.opts);

    // fill other assets
    if (this.head.icon) tasks.push(compute(this.head.icon));
    if (this.body.holder) tasks.push(compute(this.body.holder));
    tasks = tasks.concat(
      this.head.styles.map(compute),
      this.head.scripts.map(compute),
      this.body.scripts.map(compute),
      this.body.injectB.map(compute)
    );
    await Promise.all(tasks);

    // fill state
    const stateJSON = sanitize(JSON.stringify(state || {}));
    this.body.injectA = [new AssetRef({
      source: `window.epii={state:${stateJSON}};`,
      type: 'application/javascript',
      inline: true
    })];
  }
}

module.exports = ViewMeta;
