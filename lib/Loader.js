/* eslint-disable class-methods-use-this, no-unused-vars */

class Loader {
  constructor(options) {
    Object.defineProperty(this, 'options', { value: options, enumerable: false });
  }

  match(asset) {
    throw new Error('should override Loader.match');
  }

  async mount(asset) {
    throw new Error('should override Loader.mount');
  }
}

module.exports = Loader;
