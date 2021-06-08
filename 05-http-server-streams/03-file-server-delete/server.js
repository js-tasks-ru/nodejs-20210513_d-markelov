const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (pathname.indexOf('/') != -1 || pathname.indexOf('\\') != -1) {
    res.statusCode = 400;
    res.end('Nested dirs are not supported');
  } else {
    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'DELETE':
        fs.stat(filepath, (error, stats) => {
          if (stats) {
            fs.unlink(filepath, (err) => {
              if (!err) {
                res.statusCode = 200;
                res.end('Deleted');
              } else {
                res.statusCode = 500;
                res.end('Error: ', err.name);
              }
            })
          } else if (error.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('No such file');
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
