const http = require('node:http');
const pug = require('pug');

const server = http.createServer((req, res) => {
  console.info(`[${new Date()}] ${req.method} ${req.url}`);

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(pug.renderFile('./views/setup.pug'));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>ページが見つかりません</h1>');
  }
});

const port = 8000;
server.listen(port, () => {
  console.info(`http://localhost:${port} で起動しました`);
});
