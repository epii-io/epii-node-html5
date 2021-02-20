module.exports = {
  head: {
    metas: {
      name: 'test',
      content: 'test'
    },
    icon: 'x.png',
    title: 'x',
    styles: 'theme.css',
    scripts: 'theme.js'
  },

  body: {
    holder: {
      raw: '<div id="app"></div>'
    },
    scripts: [
      'layout.js',
      'x.js'
    ],
    launch: 'launch.js'
  }
}
