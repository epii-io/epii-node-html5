/* global describe it */

const assert = require('assert');
const path = require('path');
const HTML5 = require('../');
const MetaPack = HTML5.MetaPack;

const rootDir = path.join(__dirname, 'fixture');

describe('MetaPack', () => {
  it('new MetaPack', () => {
    assert.throws(() => {
      const metaPack = new MetaPack();
      console.log(metaPack);
    });
  });

  it('resolve path', () => {
    const metaPack1 = new MetaPack(rootDir);
    assert.equal(
      metaPack1.resolve('a.meta.js'),
      path.join(rootDir, 'a.meta.js')
    );
    const metaPack2 = new MetaPack(name => {
      return name.endsWith('index.meta.js') ? path.join(rootDir, name) : name;
    });
    assert.equal(metaPack2.resolve('a.meta.js'), 'a.meta.js');
    assert.equal(
      metaPack2.resolve('index.meta.js'),
      path.join(rootDir, 'index.meta.js')
    );
    const metaPack3 = new MetaPack({});
    assert.equal(metaPack3.resolve('a.meta.js'), '');
  });

  it('load and merge', () => {
    const metaPack = new MetaPack(rootDir);
    const metaZ = metaPack.loadViewMeta('z.meta.js');
    console.log(metaZ);
    const metaA = metaPack.loadViewMeta('a.meta.js');
    const meta0 = metaPack.loadViewMeta('0.meta.js');
    assert.deepEqual(metaA.head.metas, [
      { name: 'test', content: 'test' },
      { http: 'test1', content: 'test' },
      { http: 'test2' },
      {}
    ]);
    assert.equal(metaA.head.title, 'a');
    assert.deepEqual(metaA.head.styles.map(s => s.src), [
      'theme.css', 'a.css', ''
    ]);
    assert.deepEqual(metaA.head.scripts.map(s => s.src), [
      'theme.js', 'a1.js'
    ]);
    assert.deepEqual(metaA.body.scripts.map(s => s.src), [
      'layout.js', 'a2.js'
    ]);
    assert.equal(meta0.head.title, 'z');
    assert.equal(meta0.body.holder, null);
  });

  it('load and merge | ex', () => {
    const metaPack = new MetaPack(rootDir);
    assert.throws(() => {
      metaPack.loadViewMeta('l.meta.js');
    });
    metaPack.loadViewMeta('m.meta.js');
  });
});
