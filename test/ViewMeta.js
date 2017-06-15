'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const HTML5 = require('../')
const ViewMeta = HTML5.ViewMeta
const AssetRef = HTML5.AssetRef

const emptyHead = {
  title: '', metas: [], icon: null, styles: [], scripts: []
}
const emptyBody = {
  holder: null, scripts: [], injectA: [], injectB: []
}

describe('new ViewMeta', function () {
  it('ViewMeta opts', function () {
    var opts1 = ViewMeta.getOpts()
    var opts2 = ViewMeta.getOpts({ prefix: {}, source: {} })
    var opts3 = ViewMeta.getOpts({ prefix: '/', source: '' })
    var opts4 = ViewMeta.getOpts({ prefix: 'abc', source: '' })
    assert.deepEqual(opts1, { prefix: '/', source: '' })
    assert.deepEqual(opts2, { prefix: '/', source: '' })
    assert.deepEqual(opts3, { prefix: '/', source: '' })
    assert.deepEqual(opts4, { prefix: '/abc', source: '' })
  })

  it('empty meta', function () {
    var meta1 = new ViewMeta()
    var meta2 = new ViewMeta('invalid input')
    assert.deepEqual(meta1.head, emptyHead)
    assert.deepEqual(meta1.body, emptyBody)
    assert.deepEqual(meta2.head, emptyHead)
    assert.deepEqual(meta2.body, emptyBody)
  })

  it('meta with html', function () {
    var meta = new ViewMeta({ html: 'abc.html' })
    assert.deepEqual(meta.html, {
      type: 'text/html', src: 'abc.html', source: null, inline: true
    })
  })

  it('meta with meta', function () {
    var meta1 = new ViewMeta({ base: 'abc', head: {}, body: {} })
    var meta2 = new ViewMeta({
      base: 'abc',
      head: {
        icon: 'abc.png',
        metas: {},
        styles: 'abc.css',
        scripts: ['abc1.js']
      },
      body: {
        holder: { source: '<div id="app"></div>' },
        scripts: 'abc2.js',
        launch: { src: 'launch.js', inline: true }
      }
    })
    assert.deepEqual(meta1.head, emptyHead)
    assert.deepEqual(meta1.body, emptyBody)
    assert.deepEqual(meta2.head.icon, {
      src: 'abc.png', type: 'image/png', inline: false, source: null
    })
    assert.deepEqual(meta2.head.metas, [{}])
    assert.deepEqual(meta2.head.styles, [{
      src: 'abc.css', type: 'text/css', inline: false, source: null
    }])
    assert.deepEqual(meta2.head.scripts, [{
      src: 'abc1.js', type: 'application/javascript',
      inline: false, source: null
    }])
    assert.deepEqual(meta2.body.holder, {
      src: '', type: 'text/html',
      inline: true, source: '<div id="app"></div>'
    })
    assert.deepEqual(meta2.body.scripts, [{
      src: 'abc2.js', type: 'application/javascript',
      inline: false, source: null
    }])
    assert.deepEqual(meta2.body.injectB, [{
      src: 'launch.js', type: 'application/javascript',
      inline: true, source: null
    }])
  })
})

describe('mount ViewMeta', function () {
  it('null state', async function () {
    var meta = new ViewMeta()
    try {
      await meta.mount()
    } catch (error) {
      console.log(error)
    }
    assert.deepEqual(meta.body.injectA, [{
      src: '',
      source: 'window.epii={state:{}};',
      type: 'application/javascript',
      inline: true
    }])
  })

  it('simple state', async function () {
    var meta = new ViewMeta()
    await meta.mount({ hello: 'world' })
    assert.deepEqual(meta.body.injectA, [{
      src: '',
      source: 'window.epii={state:{"hello":"world"}};',
      type: 'application/javascript',
      inline: true
    }])
  })

  it('mount with state function error', function () {
    var meta = new ViewMeta()
    return meta.mount(() => {}).catch(error => {
      assert.deepEqual(error.message, 'state function not support')
    })
  })

  it('maybe xss state', async function () {
    var meta = new ViewMeta()
    await meta.mount({ hello: '<script>alert("abc");</script>' })
    assert.deepEqual(meta.body.injectA, [{
      src: '',
      source: 'window.epii={state:{"hello":"\\u003Cscript\\u003Ealert(\\"abc\\");\\u003C\\u002Fscript\\u003E"}};',
      type: 'application/javascript',
      inline: true
    }])
  })

  it('load asset', async function () {
    var loader = (asset, query) => {
      if (asset.type === 'text/css') asset.source = 'p{color:red;}'
      if (asset.src === 'index.html') asset.source = '<p></p>'
    }
    var meta1 = new ViewMeta({ html: 'index.html' })
    await meta1.mount(null, loader)
    assert.deepEqual(meta1.html, {
      src: 'index.html', type: 'text/html',
      inline: true, source: '<p></p>'
    })

    var meta2 = new ViewMeta({
      head: { styles: 'abc.css' },
      body: { holder: { src: '', inline: true, source: '<div></div>' } }
    })
    await meta2.mount(null, loader)
    assert.deepEqual(meta2.head.styles, [{
      src: 'abc.css', type: 'text/css',
      inline: false, source: 'p{color:red;}'
    }])
    assert.deepEqual(meta2.body.holder, {
      src: '', type: 'text/html',
      inline: true, source: '<div></div>'
    })
  })
})

describe('merge ViewMeta', function () {
  it('empty merge', function () {
    var meta = new ViewMeta()
    var metaM = meta.merge()
    assert.equal(meta, metaM)
  })

  it('not overwrite html', function () {
    var meta = new ViewMeta({ html: 'a.html' })
    var metaX = new ViewMeta({ html: 'b.html' })
    var metaM = meta.merge(metaX)
    assert.notEqual(meta, metaM)
    assert.equal(metaM.html.src, 'a.html')
  })

  it('no match, no error', function () {
    var meta = new ViewMeta({ head: {}, body: {} })
    var metaX = new ViewMeta({ html: 'b.html' })
    var metaM = meta.merge(metaX)
    assert.notEqual(meta, metaM)
    assert.equal(metaM.html, null)
  })
})
