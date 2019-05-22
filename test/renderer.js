/* global describe it */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HTML5 = require('../');
const MetaPack = HTML5.MetaPack;

const rootDir = path.join(__dirname, 'fixture');
const metaPack = new MetaPack(rootDir, { source: rootDir });

describe('renderToString', () => {
  it('render example a', async () => {
    const metaZ = metaPack.loadViewMeta('z.meta.js');
    console.log(metaZ);
    const metaA = metaPack.loadViewMeta('a.meta.js');
    await metaA.mount();
    const html = HTML5.renderToString(metaA);
    assert.equal(
      html.trim(),
      fs.readFileSync(path.join(__dirname, './fixture/a.html'), 'utf8').trim()
    );
  });

  it('render example b', async () => {
    const metaB = metaPack.loadViewMeta('b.meta.js');
    await metaB.mount();
    const html = HTML5.renderToString(metaB);
    assert.equal(
      html.trim(),
      fs.readFileSync(path.join(__dirname, './fixture/b.html'), 'utf8').trim()
    );
  });

  it('render example c', async () => {
    const metaC = metaPack.loadViewMeta('c.meta.js');
    await metaC.mount();
    const html = HTML5.renderToString(metaC);
    assert.equal(
      html.trim(),
      'no html'
    );
  });
});
