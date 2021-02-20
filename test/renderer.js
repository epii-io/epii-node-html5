/* global describe it */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HTML5 = require('../');
const ViewPack = HTML5.ViewPack;
const FileLoader = HTML5.FileLoader;

const rootDir = path.join(__dirname, 'fixture');
const viewPack = new ViewPack(rootDir, { source: rootDir });

describe('renderToString', () => {
  it('use loader', () => {
    viewPack.useLoader(FileLoader);
  });

  it('render example a', async () => {
    const metaZ = viewPack.loadViewMeta('z.meta.js');
    console.log(metaZ); // load base meta
    const metaA = viewPack.loadViewMeta('a.meta.js');
    await metaA.mount(viewPack.loaders);
    const html = HTML5.renderToString(metaA);
    assert.strictEqual(
      html.trim(),
      fs.readFileSync(path.join(__dirname, './fixture/a.html'), 'utf8').trim()
    );
  });

  it('render example b', async () => {
    const metaB = viewPack.loadViewMeta('b.meta.js');
    await metaB.mount(viewPack.loaders);
    const html = HTML5.renderToString(metaB);
    assert.strictEqual(
      html.trim(),
      fs.readFileSync(path.join(__dirname, './fixture/b.html'), 'utf8').trim()
    );
  });

  it('render example c', async () => {
    const metaC = viewPack.loadViewMeta('c.meta.js');
    await metaC.mount(viewPack.loaders);
    const html = HTML5.renderToString(metaC);
    assert.strictEqual(
      html.trim(),
      'no html'
    );
  });
});
