/* eslint-disable no-await-in-loop, global-require, no-param-reassign */

const path = require('path');
const rootDir = path.join(__dirname, 'fixture');

async function benchmark(label, stage) {
  const total = 100000;
  const split = '='.repeat(4);
  console.log(split, label, split);
  const context = {};
  const time0 = new Date();
  await stage.launch(context);
  const time1 = new Date();
  const output = '';
  for (const i = 0; i < total; i += 1) {
    output = await stage.render(context);
  }
  const time2 = new Date();
  console.log(output);
  console.log(`${time2 - time0}ms=${time1 - time0}ms+${time2 - time1}ms\n`);
}

async function main() {
  await benchmark('epii', {
    launch: async (context) => {
      const HTML5 = require('../');
      const metaPack = new HTML5.MetaPack(rootDir, { source: rootDir });
      const meta = metaPack.loadViewMeta('x.meta.js');
      await meta.mount();
      context.HTML5 = HTML5;
      context.meta = meta;
    },

    render: async (context) => {
      return context.HTML5.renderToString(context.meta);
    }
  });

  await benchmark('handlebars', {
    launch: async (context) => {
      const fs = require('fs');
      const handlebars = require('handlebars');
      const SOURCE = fs.readFileSync(path.join(rootDir, 'x.hbs'));
      const render = handlebars.compile(SOURCE.toString());
      const layout = {
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
      };
      context.render = render;
      context.layout = layout;
    },

    render: async (context) => {
      return context.render(context.layout);
    }
  });

  await benchmark('react', {
    launch: async (context) => {
      const React = require('react');
      const ReactDOMServer = require('react-dom/server');
      const meta = require(path.join(rootDir, 'x.jsx.js'));
      const view = React.createElement(meta);
      context.view = view;
      context.ReactDOMServer = ReactDOMServer;
    },

    render: async (context) => {
      return context.ReactDOMServer.renderToStaticMarkup(context.view);
    }
  });
}

main();
