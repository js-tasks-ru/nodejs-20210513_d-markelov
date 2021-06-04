const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {

  #data = '';

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const lines = ((this.#data ? this.#data : "") + chunk.toString()).split(os.EOL);
    this.#data = lines.pop();
    for (let line of lines) { this.push(line); }
    callback();
  }

  _flush(callback) {
    if(this.#data) {this.push(this.#data);}
    callback();
  }
}

module.exports = LineSplitStream;
