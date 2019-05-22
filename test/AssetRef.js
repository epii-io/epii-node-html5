/* global describe it Promise */

const assert = require('assert');
const path = require('path');
const HTML5 = require('../');
const AssetRef = HTML5.AssetRef;

describe('new AssetRef', () => {
  it('empty ref', () => {
    assert.throws(() => {
      const ref = new AssetRef();
      console.log(ref);
    }, Error);
  });

  it('string ref', () => {
    const ref = new AssetRef('a.js');
    assert.deepEqual(ref, {
      type: 'application/javascript',
      src: 'a.js',
      source: null,
      inline: false
    });
  });

  it('empty object ref', () => {
    const ref = new AssetRef({});
    assert.deepEqual(ref, {
      type: 'text/plain',
      src: '',
      source: null,
      inline: false
    });
  });

  it('object ref', () => {
    const ref = new AssetRef({ src: 'a.css', inline: true });
    assert.deepEqual(ref, {
      type: 'text/css',
      src: 'a.css',
      source: null,
      inline: true
    });
  });

  it('function ref', () => {
    const ref = new AssetRef(() => () => () => () => 'index.html');
    assert.deepEqual(ref, {
      type: 'text/html',
      src: 'index.html',
      source: null,
      inline: false
    });
  });
});

describe('AssetRef getter', () => {
  it('get scheme', () => {
    const ref1 = new AssetRef('a.txt');
    const ref2 = new AssetRef('//a.txt');
    const ref3 = new AssetRef('az09.-+://a.txt');
    assert.equal(ref1.getScheme(), '');
    assert.equal(ref2.getScheme(), 'https');
    assert.equal(ref3.getScheme(), 'az09.-+');
  });

  it('get encoding', () => {
    const ref1 = new AssetRef('a.txt');
    const ref2 = new AssetRef('a.js');
    const ref3 = new AssetRef('a.json');
    const ref4 = new AssetRef('a.jpg');
    assert.equal(ref1.getEncoding(), 'utf8');
    assert.equal(ref2.getEncoding(), 'utf8');
    assert.equal(ref3.getEncoding(), 'utf8');
    assert.equal(ref4.getEncoding(), undefined);
  });

  it('get comment', () => {
    const ref1 = new AssetRef('a.html');
    const ref2 = new AssetRef('a.css');
    const ref3 = new AssetRef('a.js');
    const ref4 = new AssetRef('a.jpg');
    assert.equal(ref1.getComment('test'), '<!-- epii:test -->');
    assert.equal(ref2.getComment('test'), '/* epii:test */');
    assert.equal(ref3.getComment('test'), '// epii:test');
    assert.equal(ref4.getComment('test'), 'test');
    assert.equal(ref4.getComment(), 'error');
  });
});

describe('compute AssetRef', () => {
  it('fix url with prefix', () => {
    const ref1 = new AssetRef({ src: 'a.js' });
    const ref2 = new AssetRef({ src: 'a.js' });
    const ref3 = new AssetRef({ src: 'abc://a.js' });
    // always assert absolute src
    return Promise.all([
      ref1.compute().then(() => assert.equal(ref1.src, '/a.js')),
      ref2.compute({ prefix: '/_abc' }).then(() => {
        assert.equal(ref2.src, '/_abc/a.js');
      }),
      ref3.compute().then(() => assert.equal(ref3.src, 'abc://a.js'))
    ]);
  });

  it('load local file', () => {
    const ref1 = new AssetRef({ src: 'a.js', inline: true });
    const ref2 = new AssetRef({ src: 'a.js', inline: true });
    const ref3 = new AssetRef({ source: 'abc' });
    return Promise.all([
      ref1.compute().then(s => {
        assert.equal(s, '// epii:file system error');
        assert.equal(ref1.source, null);
      }),
      ref2.compute({ source: path.join(__dirname, 'fixture') }).then(s => {
        assert.equal(s, 'alert(1)\n');
        assert.equal(ref2.source, 'alert(1)\n');
      }),
      ref3.compute().then(s => {
        assert.equal(s, 'abc');
        assert.equal(ref3.source, 'abc');
      })
    ]);
  });

  it('custom loader', () => {
    const loader = (asset, query) => {
      console.log(query);
      const scheme = asset.getScheme();
      if (scheme === 'abc') return Promise.resolve(asset.src);
      if (scheme === 'def') return Promise.reject(new Error('def'));
      if (scheme === 'omg') return 'oh my gzz';
      if (scheme === 'xyz') {
        return Promise.reject(new AssetRef.ChainError('xyz'));
      }
      throw new Error('crash');
    };
    const ref1 = new AssetRef({ src: 'abc://a.js', inline: true });
    const ref2 = new AssetRef({ src: 'def://a.js', inline: true });
    const ref3 = new AssetRef({ src: 'omg://a.js', inline: true });
    const ref4 = new AssetRef({ src: 'xyz://a.js', inline: true });
    const ref5 = new AssetRef({ src: 'http://normal', inline: true });
    return Promise.all([
      ref1.compute(loader).then(s => assert.equal(s, 'abc://a.js')),
      ref2.compute(loader).then(s => {
        assert.equal(s, '// epii:custom loader error');
      }),
      ref3.compute(loader).then(s => assert.equal(s, 'oh my gzz')),
      ref4.compute(loader).then(s => {
        assert.equal(s, '// epii:loader required');
      }),
      ref5.compute(loader).then(s => {
        assert.equal(s, 'custom loader error');
      })
    ]);
  });
});
