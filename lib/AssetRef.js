const mime = require('mime');

/**
 * terminate function
 *
 * @param  {*} fn
 * @return {*}
 */
function terminate(fn) {
  return typeof fn !== 'function' ? fn : terminate(fn());
}

/**
 * get MIME by file name
 *
 * @param  {String} file
 * @return {String}
 */
function getFileMIME(file) {
  return mime.getType(file) || 'text/plain';
}

/**
 * class AssetRef
 */
class AssetRef {
  constructor(data) {
    const type = typeof data;
    if (type === 'string') {
      this.src = data;
      this.raw = null;
      this.type = getFileMIME(data);
      this.inline = false;
    } else if (type === 'object') {
      this.src = data.src || '';
      if (data.source) {
        console.log('use field [raw] instead of field [source]');
      }
      this.raw = data.raw || data.source || null;
      this.type = data.type || getFileMIME(this.src);
      this.inline = data.inline || false;
    } else if (type === 'function') {
      return new AssetRef(terminate(data));
    } else {
      throw new Error('invalid asset');
    }
    this.mounted = false;
  }

  /**
   * get scheme of src
   *
   * @return {String}
   */
  getScheme() {
    const index = this.src.indexOf('//');
    if (index < 0) return '';
    const head = this.src.slice(0, index);
    return /^[a-z]+[a-z0-9+-.]*:$/.test(head) ? head.slice(0, head.length - 1) : 'https';
  }

  /**
   * get encoding by type
   *
   * @return {String}
   */
  getEncoding() {
    if (/^text|(javascript|json)$/.test(this.type)) {
      // utf-8 for document
      return 'utf8';
    }
    // return nothing works well for raw
    // NEVER return explicit buffer/binary
    // fs API use null for raw buffer
    // child_process API use null for smart type
    //  => utf8 for text & MAYBE raw buffer for raw
    return undefined;
  }

  /**
   * get error comment
   *
   * @param  {String} error
   * @return {String}
   */
  getComment(error) {
    const comment = error || 'error';
    switch (this.type) {
      case 'text/html': return `<!-- epii:${comment} -->`;
      case 'text/css': return `/* epii:${comment} */`;
      case 'application/javascript': return `// epii:${comment}`;
      default: return comment;
    }
  }
}

module.exports = AssetRef;
