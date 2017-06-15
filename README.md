# epii-node-html5

[![Build Status](https://travis-ci.org/epii-io/epii-node-html5.svg?branch=master)](https://travis-ci.org/epii-io/epii-node-html5)
[![Coverage Status](https://coveralls.io/repos/github/epii-io/epii-node-html5/badge.svg?branch=master)](https://coveralls.io/github/epii-io/epii-node-html5?branch=master)

HTML5 template for node server

## Features

### simple JSON template

HTML5 document can be described by the following javascript Object.

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
meta.mount({ hello: 'world' })

// also you can specify loader for resource
meta.mount({}, (asset, query) => (
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
var metaPack = new HTML5.MetaPack()

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
