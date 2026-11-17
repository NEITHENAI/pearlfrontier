const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

function createServer(port) {
  const server = http.createServer((req, res) => {
    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/') safeUrl = '/index.html';

    const filePath = path.join(PUBLIC_DIR, safeUrl);

    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        const fallback = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(fallback, (fallbackErr, content) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(content);
          }
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${Number(port) + 1}...`);
      createServer(Number(port) + 1);
    } else {
      console.error(e);
    }
  });

  server.listen(port, () => {
    console.log(`=================================================`);
    console.log(`  PEARL FRONTIER - SOVEREIGN PROTOTYPE RUNNING   `);
    console.log(`  Local URL:   http://localhost:${port}          `);
    console.log(`  Status:      100% Offline Capable              `);
    console.log(`=================================================`);
  });
}

createServer(PORT);
