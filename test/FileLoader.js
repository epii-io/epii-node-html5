/* global describe it Promise */

const assert = require('assert');
const path = require('path');
const HTML5 = require('../');
const { PO } = require('./testkit');

const AssetRef = HTML5.AssetRef;
const FileLoader = HTML5.FileLoader;

describe('FileLoader', () => {
  it('new FileLoader', () => {
    const loader1 = new FileLoader();
    const loader2 = new FileLoader({ prefix: {}, source: {} });
    const loader3 = new FileLoader({ prefix: '/', source: '' });
    const loader4 = new FileLoader({ prefix: 'abc', source: '' });
    assert.deepStrictEqual(PO(loader1), { prefix: '/', source: '' });
    assert.deepStrictEqual(PO(loader2), { prefix: '/', source: '' });
    assert.deepStrictEqual(PO(loader3), { prefix: '/', source: '' });
    assert.deepStrictEqual(PO(loader4), { prefix: '/abc', source: '' });
  });

  it('fix url with prefix', () => {
    const loader = new FileLoader({
      prefix: '/_abc',
    });
    const ref1 = new AssetRef({ src: 'a.js' });
    const ref2 = new AssetRef({ src: 'abc://a.js' });
    return Promise.all([
      loader.mount(ref1).then(() => assert.strictEqual(ref1.src, '/_abc/a.js')),
      loader.mount(ref2).then(() => assert.strictEqual(ref2.src, 'abc://a.js'))
    ]);
  });

  it('load local file', () => {
    const loader1 = new FileLoader();
    const loader2 = new FileLoader({
      source: path.join(__dirname, 'fixture'),
    });
    const ref1 = new AssetRef({ src: 'a.js', inline: true });
    const ref2 = new AssetRef({ src: 'a.js', inline: true });
    const ref3 = new AssetRef({ raw: 'abc' });
    return Promise.all([
      loader1.mount(ref1).then(() => {
        assert.deepStrictEqual(PO(ref1), {
          src: 'a.js',
          raw: '// epii:file system error',
          type: 'application/javascript',
          inline: true,
          mounted: false
        });
      }),
      loader2.mount(ref2).then(() => {
        assert.strictEqual(ref2.raw, 'alert(1)\n');
      }),
      loader1.mount(ref3).then(() => {
        assert.strictEqual(ref3.raw, 'abc');
      })
    ]);
  });
});
