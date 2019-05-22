# epii-html5

[![Build Status](https://travis-ci.org/epiijs/epii-html5.svg?branch=master)](https://travis-ci.org/epiijs/epii-html5)
[![Coverage Status](https://coveralls.io/repos/github/epiijs/epii-html5/badge.svg?branch=master)](https://coveralls.io/github/epiijs/epii-html5?branch=master)

HTML5 template for node server

## Features

### not full-featured view model

`epii-html5` provides `ViewMeta` class to define HTML5 shell, and can render `ViewMeta` object to string at server side.
** Simple. Fast. **

### simple JSON-like template

HTML5 shell can be defined by a `ViewMeta` that looks very simple.
Also you can write JS in meta file, since `loadViewMeta` using `require` to load meta.
A `ViewMeta` object can inherit another base `ViewMeta`.

### builtin meta cache

`epii-html5` provides builtin meta cache. There's no need to concern about meta cache.

## Usage

### install as dependency
```sh
npm install --save @epiijs/html5@latest
```

### use api to output HTML5
```js
const HTML5 = require('@epiijs/html5');

// create view meta
const meta = new HTML5.ViewMeta();

// mount state & inline resource
await meta.mount({ hello: 'world' });

// also you can specify loader for resource
await meta.mount({}, (asset, query) => (
  fetch(asset.src)
    .then(response => response.text())
    .then(text => asset.source = text);
));

// render view to HTML5
const html = HTML5.renderToString(meta);
```

### use api to output HTML with layout
```js
const HTML5 = require('@epiijs/html5');

// create meta pack
const metaPack = new HTML5.MetaPack('/');

// load layout meta
const layout = metaPack.loadViewMeta({
  name: 'simple',
  head: {
    title: 'simple',
    styles: ['reset.css', 'theme.css'],
    icon: 'logo.ico'
  },
  body: {
    launch: { src: 'launch.js', inline: true }
  }
});

// load view meta, auto inherit layout
const meta = metaPack.loadViewMeta({
  base: 'simple',
  head: {
    styles: 'index.css'
  },
  body: {
    scripts: 'index.js'
  }
});

// render view to HTML5
const html = HTML5.renderToString(meta);
```

## Design

### data structure

`MetaPack` = [ `ViewMeta` = [ `AssetRef` ... ] ... ]

### template

```js
{
  // template name
  name: 'modern',

  // inherited template name
  base: 'simple',

  // custom document URL or content
  // head & body will be ignored
  // html: 'index.html',

  // head part of HTML5
  head: {
    // HTML metas
    metas: [
      { name: 'keywords', content: '123' },
      { http: 'expires', content: '1 Jan 2017' },
    ],

    // HTML title
    title: 'my page',

    // HTML icon
    icon: 'logo.ico',

    // HTML styles
    // support String or String[]
    styles: [
      // simple URL
      'style1.css',

      // custom resource
      { src: 'style2.css', inline: true },
      { source: 'p { color: red; }' }
    ],

    // HTML scripts
    // support String or String[]
    scripts: [
      // simple URL
      'script1.js',

      // custom resource
      { src: 'script2.js', inline: true },
      { source: 'alert(1);' }
    ]
  },

  // body part of HTML5
  body: {
    // HTML placeholder
    // simple URL or content
    holder: { source: '<div id="app"></div>' },

    // HTML scripts
    // support String or String[]
    scripts: [],

    // web app launch script
    // e.g. ReactDOM.render
    launch: 'launch.js'
  }
};
```

### Benchmark

The following table shows elapsed time for rendering bone document to string 1e5 times.

|name|time|
|-|-|
|EPII|180ms|
|handlebars|1300ms|
|React|29000ms|
