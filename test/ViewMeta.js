/* global describe it */
/* eslint-disable no-param-reassign, object-curly-newline, class-methods-use-this, no-unused-vars */

const assert = require('assert');
const HTML5 = require('../');
const ViewMeta = HTML5.ViewMeta;
const Loader = HTML5.Loader;
const FileLoader = HTML5.FileLoader;
const { PO } = require('./testkit');

const emptyHead = {
  title: '', metas: [], icon: null, styles: [], scripts: []
};
const emptyBody = {
  holder: null, scripts: [], injectA: [], injectB: []
};

describe('new ViewMeta', () => {
  it('empty meta', () => {
    const meta1 = new ViewMeta();
    const meta2 = new ViewMeta('invalid input');
    assert.deepStrictEqual(meta1.head, emptyHead);
    assert.deepStrictEqual(meta1.body, emptyBody);
    assert.deepStrictEqual(meta2.head, emptyHead);
    assert.deepStrictEqual(meta2.body, emptyBody);
  });

  it('meta with html', () => {
    const meta = new ViewMeta({ html: 'abc.html' });
    assert.deepStrictEqual(
      PO(meta.html),
      { src: 'abc.html', raw: null, type: 'text/html', inline: true, mounted: false, }
    );
  });

  it('meta with meta', () => {
    const meta1 = new ViewMeta({ base: 'abc', head: {}, body: {} });
    const meta2 = new ViewMeta({
      base: 'abc',
      head: {
        icon: 'abc.png',
        metas: {},
        styles: 'abc.css',
        scripts: ['abc1.js']
      },
      body: {
        holder: { raw: '<div id="app"></div>' },
        scripts: 'abc2.js',
        launch: { src: 'launch.js', inline: true }
      }
    });
    assert.deepStrictEqual(meta1.head, emptyHead);
    assert.deepStrictEqual(meta1.body, emptyBody);
    assert.deepStrictEqual(
      PO(meta2.head.icon),
      { src: 'abc.png', raw: null, type: 'image/png', inline: false, mounted: false, }
    );
    assert.deepStrictEqual(meta2.head.metas, [{}]);
    assert.deepStrictEqual(
      PO(meta2.head.styles),
      [{ src: 'abc.css', raw: null, type: 'text/css', inline: false, mounted: false }]
    );
    assert.deepStrictEqual(
      PO(meta2.head.scripts),
      [{ src: 'abc1.js', raw: null, type: 'application/javascript', inline: false, mounted: false }]
    );
    assert.deepStrictEqual(
      PO(meta2.body.holder),
      { src: '', raw: '<div id="app"></div>', type: 'text/html', inline: true, mounted: false }
    );
    assert.deepStrictEqual(
      PO(meta2.body.scripts),
      [{ src: 'abc2.js', raw: null, type: 'application/javascript', inline: false, mounted: false }]
    );
    assert.deepStrictEqual(
      PO(meta2.body.injectB),
      [{ src: 'launch.js', raw: null, type: 'application/javascript', inline: true, mounted: false }]
    );
  });
});

describe('mount ViewMeta', () => {
  it('error when no loaders', () => {
    const meta = new ViewMeta();
    return meta.mount().catch((error) => {
      assert.deepStrictEqual(error.message, 'loaders not found');
    });
  });

  it('null state', async () => {
    const loader = new FileLoader();
    const meta = new ViewMeta();
    await meta.mount([loader]);
    assert.deepStrictEqual(
      PO(meta.body.injectA),
      [{ src: '', raw: 'window.epii={state:{}};', type: 'application/javascript', inline: true, mounted: false, }]
      // TODO: maybe mounted should be true
    );
  });

  it('simple state', async () => {
    const loader = new FileLoader();
    const meta = new ViewMeta();
    await meta.mount([loader], { hello: 'world' });
    assert.deepStrictEqual(
      PO(meta.body.injectA),
      [{ src: '', raw: 'window.epii={state:{"hello":"world"}};', type: 'application/javascript', inline: true, mounted: false, }]
    );
  });

  it('error when state function', () => {
    const loader = new FileLoader();
    const meta = new ViewMeta();
    return meta.mount([loader], () => {}).catch(error => {
      assert.deepStrictEqual(error.message, 'state can not be function');
    });
  });

  it('maybe xss state', async () => {
    const loader = new FileLoader();
    const meta = new ViewMeta();
    await meta.mount([loader], { hello: '<script>alert("abc");</script>' });
    assert.deepStrictEqual(
      PO(meta.body.injectA),
      [{ src: '', raw: 'window.epii={state:{"hello":"\\u003Cscript\\u003Ealert(\\"abc\\");\\u003C\\u002Fscript\\u003E"}};', type: 'application/javascript', inline: true, mounted: false, }]
    );
  });

  it('mount assets by custom loader', async () => {
    class CustomLoader extends Loader {
      match(asset) {
        return true;
      }

      async mount(asset) {
        if (asset.type === 'text/css') asset.raw = 'p{color:red;}';
        if (asset.src === 'index.html') asset.raw = '<p></p>';
        asset.mounted = true;
      }
    }

    const loader = new CustomLoader();

    const meta1 = new ViewMeta({ html: 'index.html' });
    const meta2 = new ViewMeta({
      head: { styles: 'abc.css' },
      body: { holder: { src: '', inline: true, raw: '<div></div>' } }
    });

    console.log('====', meta1);
    await meta1.mount([loader], null);
    console.log('====', meta2);
    await meta2.mount([loader], null);

    assert.deepStrictEqual(
      PO(meta1.html),
      { src: 'index.html', raw: '<p></p>', type: 'text/html', inline: true, mounted: true, }
    );
    assert.deepStrictEqual(
      PO(meta2.head.styles),
      [{ src: 'abc.css', raw: 'p{color:red;}', type: 'text/css', inline: false, mounted: true, }]
    );
    assert.deepStrictEqual(
      PO(meta2.body.holder),
      { src: '', raw: '<div></div>', type: 'text/html', inline: true, mounted: true, }
    );
  });
});

describe('merge ViewMeta', () => {
  it('empty merge', () => {
    const meta = new ViewMeta();
    const metaM = meta.merge();
    assert.strictEqual(meta, metaM);
  });

  it('not overwrite html', () => {
    const meta = new ViewMeta({ html: 'a.html' });
    const metaX = new ViewMeta({ html: 'b.html' });
    const metaM = meta.merge(metaX);
    assert.notStrictEqual(meta, metaM);
    assert.strictEqual(metaM.html.src, 'a.html');
  });

  it('no match, no error', () => {
    const meta = new ViewMeta({ head: {}, body: {} });
    const metaX = new ViewMeta({ html: 'b.html' });
    const metaM = meta.merge(metaX);
    assert.notStrictEqual(meta, metaM);
    assert.strictEqual(metaM.html, undefined);
  });
});
