const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);


  if (pathname.indexOf('/') != -1 || pathname.indexOf('\\') != -1) {
    res.statusCode = 400;
    res.end('Nested dirs are not supported');
  } else {
    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'POST':
        fs.stat(filepath, (error, stats) => {
          if (stats) {
            res.statusCode = 409;
            res.end('File already exists');
          } else if (error.code === 'ENOENT') {
            const wrStream = fs.createWriteStream(filepath);
            const lsStream = new LimitSizeStream({limit: 1000000});

            req.pipe(lsStream).pipe(wrStream);

            req.on('close', () => {
              if (!wrStream.writableFinished) {
                fs.unlink(filepath, () => {
                  wrStream.destroy();
                });
              }
            });

            lsStream.on('error', (e) => {
              if (e.code === 'LIMIT_EXCEEDED') {
                fs.unlink(filepath, () => {
                  wrStream.destroy();
                  res.statusCode = 413;
                  res.end('File is too big');
                });
              }
            });

            wrStream.on('finish', () => {
              res.statusCode = 201;
              res.end('Done');
            });
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
