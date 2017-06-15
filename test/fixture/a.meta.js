module.exports = {
  base: 'z',

  head: {
    title: 'a',
    metas: [
      { http: 'test1', content: 'test' },
      { http: 'test2' },
      {}
    ],
    styles: [
      'a.css',
      { source: 'a{color:blue;}' }
    ],
    scripts: 'a1.js'
  },

  body: {
    holder: { source: '<div id="app"></div>' },
    scripts: 'a2.js',
    launch: 'launch.js'
  }
}
