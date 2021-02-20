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
    let holder = body.holder || null;
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
   * @constructor
   */
  constructor(meta) {
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
   * get assets array
   *
   * @return {AssetRef[]}
   */
  allAssets() {
    if (this.html) {
      console.error('!! epii warn !! use html in meta');
      return [this.html];
    }
    let assets = [];
    if (this.head.icon) assets.push(this.head.icon);
    if (this.body.holder) assets.push(this.body.holder);
    assets = assets.concat(
      this.head.styles,
      this.head.scripts,
      this.body.scripts,
      this.body.injectB,
    );
    return assets;
  }

  /**
   * merge meta and self into new meta
   * self priority
   *
   * @param  {ViewMeta} view
   * @return {ViewMeta}
   */
  merge(view) {
    if (!(view instanceof ViewMeta)) return this;
    const newView = new ViewMeta();
    if (this.html) newView.html = this.html;
    else {
      if (view.head) {
        newView.head.title = this.head.title || view.head.title;
        newView.head.metas = view.head.metas.concat(this.head.metas);
        newView.head.icon = this.head.icon || view.head.icon;
        newView.head.styles = view.head.styles.concat(this.head.styles);
        newView.head.scripts = view.head.scripts.concat(this.head.scripts);
      }
      if (view.body) {
        newView.body.holder = this.body.holder || view.body.holder;
        newView.body.scripts = view.body.scripts.concat(this.body.scripts);
        newView.body.injectA = this.body.injectA;
        newView.body.injectB = view.body.injectB.concat(this.body.injectB);
      }
    }
    return newView;
  }

  /**
   * fill all assets and state
   *
   * @param  {Loader[]} loaders
   * @param  {Object=} state
   */
  async mount(loaders, state) {
    if (typeof state === 'function') {
      throw new Error('state can not be function');
    }
    if (!loaders || !loaders.length) {
      throw new Error('loaders not found');
    }

    // fill assets
    const assets = this.allAssets();
    const tasks = [];
    for (let i = 0; i < assets.length; i += 1) {
      const asset = assets[i];
      for (let j = 0; j < loaders.length; j += 1) {
        const loader = loaders[j];
        if (loader.match(asset)) {
          tasks.push(loader.mount(asset));
        }
      }
    }
    await Promise.all(tasks);

    // html mode can not set state
    if (this.html) return;

    // fill state
    const stateJSON = sanitize(JSON.stringify(state || {}));
    this.body.injectA = [
      new AssetRef({
        raw: `window.epii={state:${stateJSON}};`,
        type: 'application/javascript',
        inline: true,
      })
    ];
  }
}

module.exports = ViewMeta;
