'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const HTML5 = require('../')
const ViewMeta = HTML5.ViewMeta
const MetaPack = HTML5.MetaPack

const rootDir = path.join(__dirname, 'fixture')
const metaPack = new MetaPack(rootDir, { source: rootDir })

describe('renderToString', function () {
  it('render example a', async function () {
    var metaZ = metaPack.loadViewMeta('z.meta.js')
    var metaA = metaPack.loadViewMeta('a.meta.js')
    await metaA.mount()
    var html = HTML5.renderToString(metaA)
    assert.equal(
      html.trim(),
      fs.readFileSync(path.join(__dirname, './fixture/a.html'), 'utf8').trim()
    )
  })

  it('render example b', async function () {
    var metaB = metaPack.loadViewMeta('b.meta.js')
    await metaB.mount()
    var html = HTML5.renderToString(metaB)
    assert.equal(
      html.trim(),
      fs.readFileSync(path.join(__dirname, './fixture/b.html'), 'utf8').trim()
    )
  })

  it('render example c', async function () {
    var metaC = metaPack.loadViewMeta('c.meta.js')
    await metaC.mount()
    var html = HTML5.renderToString(metaC)
    assert.equal(
      html.trim(),
      'no html'
    )
  })
})
