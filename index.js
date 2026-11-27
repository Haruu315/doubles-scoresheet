const http = require('node:http');
const pug = require('pug');

const matches = [];

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>ページが見つかりません</h1>');
}

const server = http.createServer((req, res) => {
  console.info(`[${new Date()}] ${req.method} ${req.url}`);

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(pug.renderFile('./views/setup.pug'));
  } else if (req.method === 'POST' && req.url === '/matches') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const match = {
        teamA: params.get('teamA'),
        teamB: params.get('teamB'),
        points: [],
      };
      matches.push(match);
      const id = matches.length - 1;
      console.info(`試合開始: id=${id} ${match.teamA} 対 ${match.teamB}`);
      res.writeHead(303, { Location: `/matches/${id}` });
      res.end();
    });
  } else if (req.method === 'GET' && req.url.startsWith('/matches/')) {
    const id = Number(req.url.split('/')[2]);
    const match = matches[id];
    if (match) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(pug.renderFile('./views/match.pug', {
        teamA: match.teamA,
        teamB: match.teamB,
        scoreA: match.points.filter((p) => p === 'A').length,
        scoreB: match.points.filter((p) => p === 'B').length,
      }));
    } else {
      notFound(res);
    }
  } else {
    notFound(res);
  }
});

const port = 8000;
server.listen(port, () => {
  console.info(`http://localhost:${port} で起動しました`);
});
