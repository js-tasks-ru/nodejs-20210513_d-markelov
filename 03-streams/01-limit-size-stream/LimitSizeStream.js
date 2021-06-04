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

    if (Buffer.byteLength(this.#data+buf, encoding) > this.#limit) {
      error = new LimitExceededError;
    } else {
      this.#data+= buf;
    }

    callback(error, chunk);
  }

}

module.exports = LimitSizeStream;
