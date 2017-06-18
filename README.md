# epii-html5
###### `epii-node-html5`

[![Build Status](https://travis-ci.org/epii-io/epii-node-html5.svg?branch=master)](https://travis-ci.org/epii-io/epii-node-html5)
[![Coverage Status](https://coveralls.io/repos/github/epii-io/epii-node-html5/badge.svg?branch=master)](https://coveralls.io/github/epii-io/epii-node-html5?branch=master)

HTML5 template for node server

## Features

### not full-featured view layer

`epii-html5` can only describe HTML5 bone document with initial state and render at server side.
** Simple. Fast.**

### simple JSON-like template

HTML5 document can be described by a JS Object that looks very simple.
Also you can write JS in meta file, since `loadViewMeta` using `require` to load meta.

### builtin meta storage

`epii-html5` provides builtin meta storage. There's no need to concern about meta cache.

## Usage

### install as dependency
```sh
npm install --save epii-html5@latest
```

### use api to output HTML5
```js
const HTML5 = require('epii-html5')

// create view meta
var meta = new HTML5.ViewMeta()

// mount state & inline resource
await meta.mount({ hello: 'world' })

// also you can specify loader for resource
await meta.mount({}, (asset, query) => (
  fetch(asset.src)
    .then(response => response.text())
    .then(text => asset.source = text)
))

// render view to HTML5
var html = HTML5.renderToString(meta)
```

### use api to output HTML with layout
```js
const HTML5 = require('epii-html5')

// create meta pack
var metaPack = new HTML5.MetaPack('/')

// load layout meta
var layout = metaPack.loadViewMeta({
  name: 'simple',
  head: {
    title: 'simple',
    styles: ['reset.css', 'theme.css'],
    icon: 'logo.ico'
  },
  body: {
    launch: { src: 'launch.js', inline: true }
  }
})

// load view meta, auto inherit layout
var meta = metaPack.loadViewMeta({
  base: 'simple',
  head: {
    styles: 'index.css'
  },
  body: {
    scripts: 'index.js'
  }
})

// render view to HTML5
var html = HTML5.renderToString(meta)
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
}
```

### Benchmark

The following table shows elapsed time for rendering bone document to string 1e5 times.

|name|time|
|-|-|
|EPII|180ms|
|handlebars|1300ms|
|React|29000ms|
