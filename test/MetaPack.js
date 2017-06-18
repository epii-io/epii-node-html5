'use strict'

const assert = require('assert')
const path = require('path')
const HTML5 = require('../')
const ViewMeta = HTML5.ViewMeta
const MetaPack = HTML5.MetaPack

const rootDir = path.join(__dirname, 'fixture')

describe('MetaPack', function () {
  it('new MetaPack', function () {
    assert.throws(() => {
      var metaPack = new MetaPack()
    })
  })

  it('resolve path', function () {
    var metaPack1 = new MetaPack(rootDir)
    assert.equal(
      metaPack1.resolve('a.meta.js'),
      path.join(rootDir, 'a.meta.js')
    )
    var metaPack2 = new MetaPack(name => {
      return name.endsWith('index.meta.js') ? path.join(rootDir, name) : name
    })
    assert.equal(metaPack2.resolve('a.meta.js'), 'a.meta.js')
    assert.equal(
      metaPack2.resolve('index.meta.js'),
      path.join(rootDir, 'index.meta.js')
    )
    var metaPack3 = new MetaPack({})
    assert.equal(metaPack3.resolve('a.meta.js'), '')
  })

  it('load and merge', function () {
    var metaPack = new MetaPack(rootDir)
    var metaZ = metaPack.loadViewMeta('z.meta.js')
    var metaA = metaPack.loadViewMeta('a.meta.js')
    var meta0 = metaPack.loadViewMeta('0.meta.js')
    assert.deepEqual(metaA.head.metas, [
      { http: 'test1', content: 'test' },
      { http: 'test2' },
      {},
      { name: 'test', content: 'test' }
    ])
    assert.equal(metaA.head.title, 'a')
    assert.deepEqual(metaA.head.styles.map(s => s.src), [
      'a.css', '', 'theme.css'
    ])
    assert.deepEqual(metaA.head.scripts.map(s => s.src), [
      'a1.js', 'theme.js'
    ])
    assert.deepEqual(metaA.body.scripts.map(s => s.src), [
      'a2.js', 'layout.js'
    ])
    assert.equal(meta0.head.title, 'z')
    assert.equal(meta0.body.holder, null)
  })

  it('load and merge | ex', function () {
    var metaPack = new MetaPack(rootDir)
    assert.throws(() => {
      metaPack.loadViewMeta('l.meta.js')
    })
    metaPack.loadViewMeta('m.meta.js')
  })
})
