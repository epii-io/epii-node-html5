'use strict'

const React = require('react')
const H = React.createElement
const Component = React.Component

class X extends Component {
  render() {
    var result =
      // todo: add doctype
      H('html', null,
        H('head', null,
          // todo: add charset
          H('meta', { name: 'test', content: 'test' }),
          H('link', { rel: 'stylesheet', type: 'text/css', href: '/theme.css' }),
          H('script', { type: 'application/javascript', src: '/theme.js' }),
          H('title', null, 'x'),
          H('link', { rel: 'icon', type: 'image/png', href: '/x.png' })
        ),
        H('body', null,
          H('div', { id: 'app' }),
          H('script', null, 'window.epii={state:{}};'),
          H('script', { type: 'application/javascript', src: '/layout.js' }),
          H('script', { type: 'application/javascript', src: '/x.js' }),
          H('script', { type: 'application/javascript', src: '/launch.js' })
        )
      )
    return result
  }
}

module.exports = X
