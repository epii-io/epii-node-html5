/* global describe it */

const assert = require('assert');
const HTML5 = require('../');
const AssetRef = HTML5.AssetRef;
const { PO } = require('./testkit');

describe('new AssetRef', () => {
  it('empty ref', () => {
    assert.throws(() => {
      const ref = new AssetRef();
      console.log(ref);
    }, Error);
  });

  it('string ref', () => {
    const ref = new AssetRef('a.js');
    assert.deepStrictEqual(PO(ref), {
      src: 'a.js',
      raw: null,
      type: 'application/javascript',
      inline: false,
      mounted: false,
    });
  });

  it('empty object ref', () => {
    const ref = new AssetRef({});
    assert.deepStrictEqual(PO(ref), {
      src: '',
      raw: null,
      type: 'text/plain',
      inline: false,
      mounted: false,
    });
  });

  it('object ref', () => {
    const ref = new AssetRef({ src: 'a.css', inline: true });
    assert.deepStrictEqual(PO(ref), {
      src: 'a.css',
      raw: null,
      type: 'text/css',
      inline: true,
      mounted: false,
    });
  });

  it('function ref', () => {
    const ref = new AssetRef(() => () => () => () => 'index.html');
    assert.deepStrictEqual(PO(ref), {
      src: 'index.html',
      raw: null,
      type: 'text/html',
      inline: false,
      mounted: false,
    });
  });
});

describe('AssetRef getter', () => {
  it('get scheme', () => {
    const ref1 = new AssetRef('a.txt');
    const ref2 = new AssetRef('//a.txt');
    const ref3 = new AssetRef('az09.-+://a.txt');
    assert.strictEqual(ref1.getScheme(), '');
    assert.strictEqual(ref2.getScheme(), 'https');
    assert.strictEqual(ref3.getScheme(), 'az09.-+');
  });

  it('get encoding', () => {
    const ref1 = new AssetRef('a.txt');
    const ref2 = new AssetRef('a.js');
    const ref3 = new AssetRef('a.json');
    const ref4 = new AssetRef('a.jpg');
    assert.strictEqual(ref1.getEncoding(), 'utf8');
    assert.strictEqual(ref2.getEncoding(), 'utf8');
    assert.strictEqual(ref3.getEncoding(), 'utf8');
    assert.strictEqual(ref4.getEncoding(), undefined);
  });

  it('get comment', () => {
    const ref1 = new AssetRef('a.html');
    const ref2 = new AssetRef('a.css');
    const ref3 = new AssetRef('a.js');
    const ref4 = new AssetRef('a.jpg');
    assert.strictEqual(ref1.getComment('test'), '<!-- epii:test -->');
    assert.strictEqual(ref2.getComment('test'), '/* epii:test */');
    assert.strictEqual(ref3.getComment('test'), '// epii:test');
    assert.strictEqual(ref4.getComment('test'), 'test');
    assert.strictEqual(ref4.getComment(), 'error');
  });
});
