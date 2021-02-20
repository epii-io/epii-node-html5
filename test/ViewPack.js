/* global describe it */

const assert = require('assert');
const path = require('path');
const HTML5 = require('..');
const ViewPack = HTML5.ViewPack;

const rootDir = path.join(__dirname, 'fixture');

describe('ViewPack', () => {
  it('new ViewPack', () => {
    assert.throws(() => {
      const viewPack = new ViewPack();
      console.log(viewPack);
    });
  });

  it('resolve path', () => {
    const viewPack1 = new ViewPack(rootDir);
    assert.strictEqual(
      viewPack1.resolve('a.meta.js'),
      path.join(rootDir, 'a.meta.js')
    );
    const viewPack2 = new ViewPack(name => {
      return name.endsWith('index.meta.js') ? path.join(rootDir, name) : name;
    });
    assert.strictEqual(viewPack2.resolve('a.meta.js'), 'a.meta.js');
    assert.strictEqual(
      viewPack2.resolve('index.meta.js'),
      path.join(rootDir, 'index.meta.js')
    );
    const viewPack3 = new ViewPack({});
    assert.strictEqual(viewPack3.resolve('a.meta.js'), '');
  });

  it('load and merge', () => {
    const viewPack = new ViewPack(rootDir);
    const metaZ = viewPack.loadViewMeta('z.meta.js');
    console.log(metaZ);
    const metaA = viewPack.loadViewMeta('a.meta.js');
    const meta0 = viewPack.loadViewMeta('0.meta.js');
    assert.deepStrictEqual(metaA.head.metas, [
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
    const viewPack = new ViewPack(rootDir);
    assert.throws(() => {
      viewPack.loadViewMeta('l.meta.js');
    });
    viewPack.loadViewMeta('m.meta.js');
  });
});
