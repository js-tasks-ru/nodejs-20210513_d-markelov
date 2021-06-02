const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {

  #limit = null;
  #data = '';

  constructor(options) {
    super(options);
    if (options.limit) {
      this.#limit = options.limit;
    }
  }

  _transform(chunk, encoding, callback) {
    let error;
    const buf = chunk.toString()
    try {
      if (Buffer.byteLength(this.#data+buf, encoding) > this.#limit) {
        throw new LimitExceededError;
      } else {
        this.#data += buf;
      }
    } catch (e) {
      error = e;
    }
    callback(error, chunk);
  }

}

module.exports = LimitSizeStream;
