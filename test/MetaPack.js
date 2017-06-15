'use strict'

const assert = require('assert')
const path = require('path')
const HTML5 = require('../')
const ViewMeta = HTML5.ViewMeta
const MetaPack = HTML5.MetaPack

const rootDir = path.join(__dirname, 'fixture')
const metaPack = new MetaPack()

describe('MetaPack', function () {
  it('load and merge', function () {
    var metaZ = metaPack.loadViewMeta(path.join(rootDir, 'z.meta.js'))
    var metaA = metaPack.loadViewMeta(path.join(rootDir, 'a.meta.js'))
    var meta0 = metaPack.loadViewMeta(path.join(rootDir, '0.meta.js'))
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
})
