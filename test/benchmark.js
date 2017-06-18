'use strict'

const path = require('path')
const rootDir = path.join(__dirname, 'fixture')

async function benchmark(label, stage, total) {
  var split = '='.repeat(4)
  if (!total) total = 100000
  console.log(split, label, split)
  var context = {}
  var time0 = new Date()
  await stage.launch(context)
  var time1 = new Date()
  var output = ''
  for (var i = 0; i < total; i ++) {
    output = await stage.render(context)
  }
  var time2 = new Date()
  console.log(output)
  console.log(`${time2 - time0}ms=${time1 - time0}ms+${time2 - time1}ms\n`)
}

async function main() {
  await benchmark('epii', {
    launch: async function (context) {
      var HTML5 = require('../')
      var metaPack = new HTML5.MetaPack(rootDir, { source: rootDir })
      var meta = metaPack.loadViewMeta('x.meta.js')
      await meta.mount()
      context.HTML5 = HTML5
      context.meta = meta
    },

    render: async function (context) {
      return context.HTML5.renderToString(context.meta)
    }
  })

  await benchmark('handlebars', {
    launch: async function (context) {
      var fs = require('fs')
      var handlebars = require('handlebars')
      var SOURCE = fs.readFileSync(path.join(rootDir, 'x.hbs'))
      var render = handlebars.compile(SOURCE.toString())
      var layout = {
        head: {
          metas: [{ name: 'test', content: 'test' }],
          styles: [{ src: '/theme.css' }],
          scripts: [{ src: '/theme.js' }],
          icon: { src: 'x.png', type: 'image/png' },
          title: 'x'
        },
        body: {
          holder: { source: '<div id="app"></div>' },
          scripts: [
            { source: 'window.epii={state:{}};' },
            { src: '/layout.js' },
            { src: '/x.js' },
            { src: '/launch.js' },
          ]
        }
      }
      context.render = render
      context.layout = layout
    },

    render: async function (context) {
      return context.render(context.layout)
    }
  })

  await benchmark('react', {
    launch: async function (context) {
      var React = require('react')
      var ReactDOMServer = require('react-dom/server')
      var meta = require(path.join(rootDir, 'x.jsx.js'))
      var view = React.createElement(meta)
      context.view = view
      context.ReactDOMServer = ReactDOMServer
    },

    render: async function (context) {
      return context.ReactDOMServer.renderToStaticMarkup(context.view)
    }
  })
}

main()
