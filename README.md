# epii-html5

[![Build Status](https://travis-ci.org/epiijs/epii-html5.svg?branch=master)](https://travis-ci.org/epiijs/epii-html5)
[![Coverage Status](https://coveralls.io/repos/github/epiijs/epii-html5/badge.svg?branch=master)](https://coveralls.io/github/epiijs/epii-html5?branch=master)

A modern web app uses scripts to carry user interfaces instead of static HTML, however, scripts still should be run in app shell such as `index.html`. App shell contains a bit of DOM container and references of scripts and styles. `epii-html5` is a web app shell definition.

## Features

A web app shell can be defined by a simple `ViewMeta` JSON-like model.
Also JS can be written in definition and will be run in server.
A `ViewMeta` object can inherit from a base `ViewMeta` object.

### example for ViewMeta

```js
{
  // template name
  name: 'modern',

  // inherited template name
  base: 'simple',

  // html: 'index.html',
  // custom everything manually
  // head & body will be ignored

  // head part of app shell
  head: {
    // document metas
    metas: [
      // name
      { name: 'creator', content: 'epii' },
      // http-equiv
      { http: 'expires', content: '1 Jan 2017' },
    ],

    // document title
    title: 'my web app',

    // document icon
    icon: 'logo.jpeg',

    // document styles, String | String[]
    styles: [
      // simple URI
      'style-01.css',

      // inline content from local file
      { src: 'style-02.css', inline: true },

      // inline content directly
      { raw: 'p { color: red; }' }
    ],

    // document scripts, String | String[]
    scripts: [
      // simple URI
      'script-01.js',

      // inline content from local file
      { src: 'script-02.js', inline: true },

      // inline content directly
      { raw: 'alert(1);' }
    ]
  },

  // body part of app shell
  body: {
    // app DOM container
    // simple URI or HTML content
    holder: { raw: '<div id="app"></div>' },

    // document scripts, String | String[]
    scripts: [],

    // web app launch script
    // e.g. ReactDOM.render
    launch: 'launch.js'
  }
};
```

## Usage

### install as dependency
```sh
npm install --save @epiijs/html5@latest
```

### use API to output HTML5
```js
const HTML5 = require('@epiijs/html5');

// get default local file loader
const loader = new HTML5.FileLoader();

// create view meta
const view = new HTML5.ViewMeta();


// mount state & inline resource
// window.epii = { state: { hello: 'world' } };
await view.mount([loader], { hello: 'world' });

// render view to HTML5
const html = HTML5.renderToString(meta);
```

### use API to output HTML with layout
```js
const HTML5 = require('@epiijs/html5');

// create meta pack
const viewPack = new HTML5.ViewPack('/');

// load layout meta
const layout = viewPack.loadViewMeta({
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
const meta = viewPack.loadViewMeta({
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

### custom loader
```js
class CustomLoader extends HTML5.Loader {
  constructor(options) {
    super(options);
    // parse your own loader query
  }

  match(asset) {
    // filter assets
    return true;
  }

  async mount(asset) {
    // mount asset as you wish
    if (asset.mounted) return;
    return fetch(asset.src)
      .then(response => response.text())
      .then((text) => {
        asset.raw = text;
        asset.mounted = true;
      });
  }
}

// use loader for view pack
viewPack.useLoader(CustomLoader, { ...options });

// mount meta with view pack loaders
viewMeta.mount(viewPack.loaders, {});
```

## Benchmark

The following table shows elapsed time for rendering app shell to string 1e5 times.

(2021/02/20, MacBook Pro 2019)

|name|time|
|-|-|
|epii-html5 @ 1.0.0|96ms|
|handlebars @ 4.7.7|1600ms|
|react @ 17.0.1|4474ms|
