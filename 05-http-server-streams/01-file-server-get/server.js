const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.indexOf('/') != -1 || pathname.indexOf('\\') != -1) {
    res.statusCode = 400;
    res.end('Nested dirs are not supported');
  } else {
    switch (req.method) {
      case 'GET':
        fs.stat(filepath, (error) => {
          if (!error) {
            const stream = fs.createReadStream(filepath);
            stream.pipe(res);
          } else if (error.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('File not found');
          } else {
            res.statusCode = 500;
            res.end('Some error occured');
          }
        });

        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  }
});

module.exports = server;
