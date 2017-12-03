'use strict'

module.exports = {
  renderToString
}

/**
 * concat string
 *
 * @param  {String[]} lines
 * @return {String}
 */
function concatString(lines) {
  var output = ''
  for (var i = 0; i < lines.length; i ++) {
    output += lines[i] + '\n'
  }
  return output
}

/**
 * render meta
 *
 * @param  {String} name
 * @param  {String} http
 * @param  {String} content
 * @return {String}
 */
function renderMeta(name, http, content) {
  if (http) return `<meta http-equiv="${http}" content="${content || ''}" />`
  return `<meta name="${name || 'unknown'}" content="${content || ''}" />`
}

/**
 * render link[rel=icon]
 *
 * @param  {String} type
 * @param  {String} href
 * @return {String}
 */
function renderIcon(type, href) {
  return `<link rel="icon" type="${type}" href="${href}" />`
}

/**
 * render style or link[rel=stylesheet]
 *
 * @param  {String} type
 * @param  {String} src
 * @param  {String} source
 * @return {String}
 */
function renderStyle(type, src, source) {
  if (source) return `<style>${source}</style>`
  return `<link rel="stylesheet" type="${type}" href="${src}" />`
}

/**
 * render script
 *
 * @param  {String} type
 * @param  {String} src
 * @param  {String} source
 * @return {String}
 */
function renderScript(type, src, source) {
  if (source) return `<script>${source}</script>`
  return `<script type="${type}" src="${src}"></script>`
}

/**
 * render view to HTML5
 *
 * @return {ViewMeta}
 */
function renderToString(meta) {
  if (meta.html) return meta.html.source
  var output = [
    '<!DOCTYPE html>', '<html>', '<head>', '<meta charset="utf8" />'
  ]
  var { head, body } = meta
  head.metas.forEach(e => output.push(renderMeta(e.name, e.http, e.content)))
  head.styles.forEach(e => output.push(renderStyle(e.type, e.src, e.source)))
  head.scripts.forEach(e => output.push(renderScript(e.type, e.src, e.source)))
  if (head.title) output.push(`<title>${head.title}</title>`)
  if (head.icon) output.push(renderIcon(head.icon.type, head.icon.src))
  output.push('</head>', '<body>')
  if (body.holder) output.push(body.holder.source)
  body.injectA.forEach(e => output.push(renderScript(e.type, e.src, e.source)))
  body.scripts.forEach(e => output.push(renderScript(e.type, e.src, e.source)))
  body.injectB.forEach(e => output.push(renderScript(e.type, e.src, e.source)))
  output.push('</body>', '</html>')
  return concatString(output)
}
