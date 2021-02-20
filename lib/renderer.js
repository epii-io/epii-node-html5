/**
 * concat string
 *
 * @param  {String[]} lines
 * @return {String}
 */
function concatString(lines) {
  let output = '';
  for (let i = 0; i < lines.length; i += 1) {
    output += lines[i] + '\n';
  }
  return output;
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
  if (http) {
    return `<meta http-equiv="${http}" content="${content || ''}" />`;
  }
  return `<meta name="${name || 'unknown'}" content="${content || ''}" />`;
}

/**
 * render link[rel=icon]
 *
 * @param  {String} type
 * @param  {String} href
 * @return {String}
 */
function renderIcon(type, href) {
  return `<link rel="icon" type="${type}" href="${href}" />`;
}

/**
 * render style or link[rel=stylesheet]
 *
 * @param  {String} type
 * @param  {String} src
 * @param  {String} raw
 * @return {String}
 */
function renderStyle(type, src, raw) {
  if (raw) {
    return `<style>${raw}</style>`;
  }
  return `<link rel="stylesheet" type="${type}" href="${src}" />`;
}

/**
 * render script
 *
 * @param  {String} type
 * @param  {String} src
 * @param  {String} raw
 * @return {String}
 */
function renderScript(type, src, raw) {
  if (raw) {
    return `<script>${raw}</script>`;
  }
  return `<script type="${type}" src="${src}"></script>`;
}

/**
 * render view to HTML5
 *
 * @return {ViewMeta}
 */
function renderToString(meta) {
  if (meta.html) return meta.html.raw;
  const output = ['<!DOCTYPE html>', '<html>', '<head>', '<meta charset="utf8" />'];
  const { head, body } = meta;
  head.metas.forEach(e => output.push(renderMeta(e.name, e.http, e.content)));
  head.styles.forEach(e => output.push(renderStyle(e.type, e.src, e.raw)));
  head.scripts.forEach(e => output.push(renderScript(e.type, e.src, e.raw)));
  if (head.title) output.push(`<title>${head.title}</title>`);
  if (head.icon) output.push(renderIcon(head.icon.type, head.icon.src));
  output.push('</head>', '<body>');
  if (body.holder) output.push(body.holder.raw);
  body.injectA.forEach(e => output.push(renderScript(e.type, e.src, e.raw)));
  body.scripts.forEach(e => output.push(renderScript(e.type, e.src, e.raw)));
  body.injectB.forEach(e => output.push(renderScript(e.type, e.src, e.raw)));
  output.push('</body>', '</html>');
  return concatString(output);
}

module.exports = {
  renderToString
};
